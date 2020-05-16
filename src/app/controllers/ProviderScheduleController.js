import ProviderSchedule from '../models/ProviderSchedule';
import User from '../models/User';

class ProviderScheduleController {

  async index(req, res) {
    const { userId } = req;

    let { start_hour, end_hour } = await ProviderSchedule.findOne({
      where: {
        provider_id: userId
      }
    });

    return res.json({ start_hour, end_hour });
  }

  async store(req, res) {
    const { startHour, endHour } = req.body;

    let start = Number(startHour);
    let end = Number(endHour);
    let { userId } = req;

    if (!start || !end)
      return res.status(400).json({ error: 'start or end hour is invalid' });

    if (start > end || start === end)
      return res.status(400).json({ error: 'EndHour must be greater than startHour' });

    if (start < 0 || start > 23)
      return res.status(400).json({ error: 'startHour must be in range of 0 - 23 hours' });

    if (end < 0 || end > 23)
      return res.status(400).json({ error: 'EndHour must be in range of 0 - 23 hours' });

    let provider = await User.findOne({
      where: {
        id: userId,
        provider: true
      }
    })

    if (!provider)
      return res.status(401).json({ error: 'Only providers can set your schedule time' });

    let currentProviderSchedule = await ProviderSchedule.findOne({
      where: {
        provider_id: userId
      }
    })

    let parsedStart = `${start}:00`;
    let parsedEnd = `${end}:00`;

    if (!currentProviderSchedule) {

      let providerSchedule = await ProviderSchedule.create({
        provider_id: userId,
        start_hour: parsedStart,
        end_hour: parsedEnd
      });

      return res.json(providerSchedule);
    }

    currentProviderSchedule.start_hour = parsedStart;
    currentProviderSchedule.end_hour = parsedEnd;

    currentProviderSchedule.save();

    return res.json(currentProviderSchedule);
  }
}

export default new ProviderScheduleController();
