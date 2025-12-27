import models from '../models/index.js';

const { ActivityLog } = models;

export const logActivity = (action_type, target_table) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
      // Log the activity after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const logData = {
          user_id: req.user?.system_user_id || null,
          action_type,
          target_table,
          target_record_id: data?.data?.id || data?.id || null,
          change_details: {
            old: req.originalData || null,
            new: data?.data || data || null
          },
          description: `${action_type} operation on ${target_table}`,
          ip_address: req.ip || req.connection.remoteAddress
        };

        ActivityLog.create(logData).catch(err => {
          console.error('Failed to log activity:', err);
        });
      }

      originalJson.call(this, data);
    };

    next();
  };
};

export const captureOriginalData = (Model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const id = req.params[idParam];
      if (id) {
        const record = await Model.findByPk(id);
        if (record) {
          req.originalData = record.toJSON();
        }
      }
      next();
    } catch (error) {
      next();
    }
  };
};