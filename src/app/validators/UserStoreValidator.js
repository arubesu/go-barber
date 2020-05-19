import * as Yup from 'yup';

const minLengthPassword = 8;

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(minLengthPassword),
    });

    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Validation Fails', messages: err.inner });
  }
}
