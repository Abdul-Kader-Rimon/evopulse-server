const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedGenders = new Set(["male", "female", "other", "prefer_not_to_say"]);

const normalizeString = (value) => String(value || "").trim();

const sendValidationError = (res, message) => {
  return res.status(400).json({
    success: false,
    message
  });
};

const validateRegisterPayload = (req, res, next) => {
  const firstName = normalizeString(req.body?.firstName || req.body?.name);
  const lastName = normalizeString(req.body?.lastName);
  const email = normalizeString(req.body?.email).toLowerCase();
  const phone = normalizeString(req.body?.phone);
  const password = String(req.body?.password || "");
  const gender = normalizeString(req.body?.gender).toLowerCase();
  const dateOfBirthRaw = normalizeString(req.body?.dateOfBirth);
  const addressesRaw = req.body?.addresses;

  if (!firstName) {
    return sendValidationError(res, "First name is required.");
  }

  if (!lastName) {
    return sendValidationError(res, "Last name is required.");
  }

  if (!email) {
    return sendValidationError(res, "Email is required.");
  }

  if (!emailRegex.test(email)) {
    return sendValidationError(res, "Please provide a valid email address.");
  }

  if (password.length < 6) {
    return sendValidationError(res, "Password must be at least 6 characters.");
  }

  if (gender && !allowedGenders.has(gender)) {
    return sendValidationError(res, "Gender must be one of male, female, other, prefer_not_to_say.");
  }

  if (dateOfBirthRaw) {
    const date = new Date(dateOfBirthRaw);
    if (Number.isNaN(date.getTime())) {
      return sendValidationError(res, "Date of birth must be a valid date.");
    }
    if (date.getTime() > Date.now()) {
      return sendValidationError(res, "Date of birth cannot be in the future.");
    }
  }

  if (typeof addressesRaw !== "undefined" && !Array.isArray(addressesRaw) && typeof addressesRaw !== "string") {
    return sendValidationError(res, "Addresses must be a list or text.");
  }

  req.body.firstName = firstName;
  req.body.lastName = lastName;
  req.body.email = email;
  req.body.phone = phone || null;
  req.body.password = password;
  req.body.gender = gender || "other";
  req.body.dateOfBirth = dateOfBirthRaw || null;
  req.body.addresses = addressesRaw;

  next();
};

const validateLoginPayload = (req, res, next) => {
  const email = normalizeString(req.body?.email).toLowerCase();
  const password = String(req.body?.password || "");

  if (!email) {
    return sendValidationError(res, "Email is required.");
  }

  if (!emailRegex.test(email)) {
    return sendValidationError(res, "Please provide a valid email address.");
  }

  if (!password) {
    return sendValidationError(res, "Password is required.");
  }

  req.body.email = email;
  req.body.password = password;

  next();
};

module.exports = {
  validateRegisterPayload,
  validateLoginPayload
};
