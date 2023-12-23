import Joi from 'joi';

/**
 * For register @POST
 */
const register = Joi.object({
    firstName: Joi.string().max(30).optional(),
    lastName: Joi.string().max(30).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    passwordConfirm: Joi.string().min(6).required(),
});

/**
 * For login @POST
 */
const login = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
});

/**
 * For update @PATCH
 */
const update = Joi.object({
    password: Joi.string().min(6).required(),
    passwordConfirm: Joi.string().min(6).required(),
});

/**
 * For forgotPassword @POST
 */
const forgotPassword = Joi.object({
    email: Joi.string().email().required(),
});

/**
 * For confirmEmail @GET
 */
const confirmEmail = Joi.object({
    token: Joi.string().min(32).required(),
});

/**
 * For resetPassword  @GET
 */
const resetPassword = Joi.object({
    token: Joi.string().min(32).required(),
});

export default { register, login, update, confirmEmail, forgotPassword, resetPassword };
