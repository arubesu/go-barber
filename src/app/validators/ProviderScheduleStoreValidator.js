function validateHours(startHour, endHour) {
  let start = Number(startHour);
  let end = Number(endHour);

  if (!start || !end)
    return 'start or end hour is invalid';

  if (start > end || start === end)
    return 'EndHour must be greater than startHour';

  if (start < 0 || start > 23)
    return 'startHour must be in range of 0 - 23 hours';

  if (end < 0 || end > 23)
    return 'EndHour must be in range of 0 - 23 hours';
}

export default async (req, res, next) => {
  const { startHour, endHour } = req.body;
  let error = validateHours(startHour, endHour);
  if (error) {
    return res.status(400).json({ error });
  }
  next();
}
