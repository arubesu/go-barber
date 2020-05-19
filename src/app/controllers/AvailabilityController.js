import AvailabilityService from '../services/AvailabilityService';

class AvailabilityController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid date!' });
    }

    const searchDate = Number(date);

    const availability = await AvailabilityService.run({
      searchDate,
      providerId: req.params.id,
    });

    return res.json(availability);
  }
}

export default new AvailabilityController();
