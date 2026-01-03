import models from '../models/index.js';

const { Asset, AssetModel, ConsumableStock, ConsumableModel, Location } = models;

/**
 * Process stock-in when purchase order is approved or completed
 * Creates assets and/or updates consumable stock based on detail orders
 */
export async function processStockIn(detailOrders, locationId = null, supplierId = null) {
  try {
    // Get a default location if not provided
    let location = null;
    if (locationId) {
      location = await Location.findByPk(locationId);
    } else {
      // Get the first available location or create a default one
      location = await Location.findOne({
        order: [['location_id', 'ASC']]
      });
    }

    if (!location) {
      throw new Error('No location available for stock-in');
    }

    const results = {
      assetsCreated: [],
      consumablesUpdated: []
    };

    for (const detail of detailOrders) {
      // Process Asset models
      if (detail.asset_model_id) {
        const assetModel = await AssetModel.findByPk(detail.asset_model_id);
        if (!assetModel) {
          throw new Error(`Asset model with ID ${detail.asset_model_id} not found`);
        }

        // Create assets for the quantity
        for (let i = 0; i < detail.quantity; i++) {
          // Auto-generate asset tag and serial number
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 10000);
          const assetTag = `AST-${assetModel.asset_model_id}-${timestamp}-${random}`;
          const serialNumber = `SN-${timestamp}-${i}`;

          const asset = await Asset.create({
            asset_tag: assetTag,
            serial_number: serialNumber,
            purchase_date: new Date().toISOString().split('T')[0],
            purchase_cost: detail.unit_price,
            current_status: 'In Stock',
            asset_model_id: detail.asset_model_id,
            location_id: location.location_id,
            supplier_id: supplierId
          });

          results.assetsCreated.push({
            assetId: asset.asset_id,
            assetTag: asset.asset_tag,
            assetModel: assetModel.asset_model_name
          });
        }
      }

      // Process Consumable models
      if (detail.consumable_model_id) {
        const consumableModel = await ConsumableModel.findByPk(detail.consumable_model_id);
        if (!consumableModel) {
          throw new Error(`Consumable model with ID ${detail.consumable_model_id} not found`);
        }

        // Check if stock already exists
        let stock = await ConsumableStock.findOne({
          where: {
            consumable_model_id: detail.consumable_model_id,
            location_id: location.location_id
          }
        });

        if (stock) {
          // Update existing stock
          const oldQuantity = stock.quantity;
          await stock.update({
            quantity: stock.quantity + detail.quantity
          });

          results.consumablesUpdated.push({
            consumableModelId: detail.consumable_model_id,
            consumableModelName: consumableModel.consumable_model_name,
            oldQuantity,
            newQuantity: stock.quantity,
            addedQuantity: detail.quantity
          });
        } else {
          // Create new stock record
          const newStock = await ConsumableStock.create({
            consumable_model_id: detail.consumable_model_id,
            location_id: location.location_id,
            quantity: detail.quantity,
            min_quantity: 10 // Default minimum quantity
          });

          results.consumablesUpdated.push({
            consumableModelId: detail.consumable_model_id,
            consumableModelName: consumableModel.consumable_model_name,
            oldQuantity: 0,
            newQuantity: newStock.quantity,
            addedQuantity: detail.quantity,
            isNew: true
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Stock-in processing error:', error);
    throw error;
  }
}

/**
 * Get location ID from purchase order (can be enhanced to track location with purchase orders)
 * Currently returns the first available location
 */
export async function getStockInLocation() {
  try {
    const location = await Location.findOne({
      where: { location_type: 'Warehouse' },
      order: [['location_id', 'ASC']]
    });

    return location || (await Location.findOne({ order: [['location_id', 'ASC']] }));
  } catch (error) {
    console.error('Get location error:', error);
    return null;
  }
}
