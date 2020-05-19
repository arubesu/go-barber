import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import User from '../models/User';
import Appointment from '../models/Appointment';

class ScheduleController {
  async index(req, res) {
    const provider = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });

    if (!provider) {
      return res.status(401).json({ error: 'User is not a provider' });
    }

    const { date } = req.query;

    const parsedDate = parseISO(date);

    const schedule = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      attributes: ['id', 'date', 'user_id'],
    });

    return res.json(schedule);
  }
}

export default new ScheduleController();
