import { Op } from 'sequelize';
import { startOfDay, endOfDay, format, isAfter } from 'date-fns'
import Appointment from '../models/Appointment';
import ProviderSchedule from '../models/ProviderSchedule';

class AvailabilityController {

  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid date!' });
    }

    var searchDate = Number(date);

    var appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)]
        }
      }
    });

    var { start_hour, end_hour } = await ProviderSchedule.findOne({
      where: {
        provider_id: req.userId
      }
    });

    if (!start_hour || !end_hour)
      return res.status(400).json({ error: 'The provider must have the schedule set' });


    let [start,] = start_hour.split(':');
    let [end,] = end_hour.split(':');

    let availability = [];

    let today = new Date();
    let currentDateTime = new Date();

    for (let hour = start; hour < end; hour++) {
      today.setHours(hour, 0, 0);

      let available = isAfter(today, currentDateTime) &&
        !appointments.some(({ date }) => date.getHours() === hour)

      availability.push({
        time: `${format(today, 'HH:mm')}`,
        value: `${format(today, "yyyy-MM-dd'T'HH:mm:ssxxx")}`,
        available: available,
      });
    }

    return res.json(availability);
  }

}

export default new AvailabilityController();
