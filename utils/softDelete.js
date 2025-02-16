const mongoose = require("mongoose");

/**
 * Soft delete a document by setting `IsDelete: true`
 * @param {mongoose.Model} model - The Mongoose model
 * @param {string} id - The document ID to be soft deleted
 * @returns {Promise<object>} - The updated document or null if not found
 */
const softDelete = async (model, id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
    }

    const deletedDoc = await model.findByIdAndUpdate(
        id,
        { isDelete: true },  // Soft delete by updating the field
        { new: true }        // Return the updated document
    );

    return deletedDoc;
};

module.exports = softDelete;
