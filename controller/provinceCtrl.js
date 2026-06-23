const Province = require("../models/provinceModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

const createProvince = asyncHandler(async (req, res) => {
    const province = await Province.create(req.body);

    res.status(201).json({
        success: true,
        data: province,
    });
});

const updateProvince = asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongoDbId(id);

    const province = await Province.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
    );

    res.json({
        success: true,
        data: province,
    });
});

const deleteProvince = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deleted = await softDelete(Province, id);

    res.json({
        success: true,
        data: deleted,
    });
});

const getProvince = asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongoDbId(id);

    const province = await Province.findById(id);

    res.json(province);
});

const getAllProvince = asyncHandler(async (req, res) => {
    const provinces = await Province.find()
        .sort({ provinceCode: 1 });

    res.json(provinces);
});

const searchProvince = asyncHandler(async (req, res) => {
    const { keyword } = req.query;

    const data = await Province.find({
        $or: [
            {
                provinceCode: {
                    $regex: keyword,
                    $options: "i",
                },
            },
            {
                provinceName: {
                    $regex: keyword,
                    $options: "i",
                },
            },
        ],
    });

    res.json(data);
});

module.exports = {
    createProvince,
    updateProvince,
    deleteProvince,
    getProvince,
    getAllProvince,
    searchProvince,
};