const XaPhuongBHXH = require("../models/xaPhuongBhxhModel");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

const createXaPhuong = asyncHandler(async (req, res) => {
    const data = await XaPhuongBHXH.create(req.body);

    res.status(201).json(data);
});

const updateXaPhuong = asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongoDbId(id);

    const data = await XaPhuongBHXH.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
    );

    res.json(data);
});

const deleteXaPhuong = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const data = await softDelete(
        XaPhuongBHXH,
        id
    );

    res.json(data);
});

const getXaPhuong = asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongoDbId(id);

    const data = await XaPhuongBHXH.findById(id)
        .populate("agency")
        .populate("province");

    res.json(data);
});

const getAllXaPhuong = asyncHandler(async (req, res) => {
    const data = await XaPhuongBHXH.find()
        .populate("agency")
        .populate("province");

    res.json(data);
});

const getByAgency = asyncHandler(async (req, res) => {
    const { agencyId } = req.params;

    const data = await XaPhuongBHXH.find({
        agency: agencyId,
    });

    res.json(data);
});

const getByProvince = asyncHandler(async (req, res) => {
    const { provinceId } = req.params;

    const data = await XaPhuongBHXH.find({
        province: provinceId,
    });

    res.json(data);
});

const lookupWardCode = asyncHandler(async (req, res) => {
    const { wardCode } = req.params;

    const data = await XaPhuongBHXH.findOne({
        wardCode,
    })
        .populate("agency")
        .populate("province");

    res.json(data);
});

const lookupWardName = asyncHandler(async (req, res) => {
    const { wardName } = req.query;

    const data = await XaPhuongBHXH.find({
        wardName: {
            $regex: wardName,
            $options: "i",
        },
    })
        .populate("agency")
        .populate("province");

    res.json(data);
});

const searchXaPhuong = asyncHandler(async (req, res) => {
    const { keyword } = req.query;

    const data = await XaPhuongBHXH.find({
        $or: [
            {
                wardCode: {
                    $regex: keyword,
                    $options: "i",
                },
            },
            {
                wardName: {
                    $regex: keyword,
                    $options: "i",
                },
            },
        ],
    })
        .populate("agency")
        .populate("province");

    res.json(data);
});

module.exports = {
    createXaPhuong,
    updateXaPhuong,
    deleteXaPhuong,
    getXaPhuong,
    getAllXaPhuong,
    getByAgency,
    getByProvince,
    lookupWardCode,
    lookupWardName,
    searchXaPhuong,
};