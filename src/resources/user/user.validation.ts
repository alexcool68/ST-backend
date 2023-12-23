import Joi from 'joi';

/**
 * For update
 */
const getUser = Joi.object({
    id: Joi.string().required(),
});

/**
 * For update
 */
const updateUser = Joi.object({
    id: Joi.string().required(),
});
/**
 * For delete
 */
const deleteUser = Joi.object({
    id: Joi.string().required(),
});
export default { getUser, updateUser, deleteUser };
