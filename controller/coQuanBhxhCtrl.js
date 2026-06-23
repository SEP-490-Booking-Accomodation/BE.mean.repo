const CoQuanBHXH = require("../models/coQuanBhxhModel");
const XaPhuongBHXH = require("../models/xaPhuongBhxhModel");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

//
// CREATE
//
const createCoQuanBhxh = asyncHandler(async (req, res) => {
    try {
        const exist = await CoQuanBHXH.findOne({
            agencyCode: req.body.agencyCode,
            isDelete: false,
        });

        if (exist) {
            return res.status(400).json({
                success: false,
                message: "Mã cơ quan BHXH đã tồn tại",
            });
        }

        const agency = await CoQuanBHXH.create(req.body);

        res.status(201).json({
            success: true,
            data: agency,
        });
    } catch (error) {
        throw new Error(error);
    }
});

//
// UPDATE
//
const updateCoQuanBhxh = asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongoDbId(id);

    try {
        const agency = await CoQuanBHXH.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
            }
        );

        res.json({
            success: true,
            data: agency,
        });
    } catch (error) {
        throw new Error(error);
    }
});

//
// DELETE
//
const deleteCoQuanBhxh = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await softDelete(CoQuanBHXH, id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy cơ quan BHXH",
            });
        }

        res.json({
            success: true,
            message: "Xóa thành công",
            data: deleted,
        });
    } catch (error) {
        throw new Error(error);
    }
});

//
// DETAIL
//
const getCoQuanBhxh = asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongoDbId(id);

    try {
        const agency = await CoQuanBHXH.findOne({
            _id: id,
            isDelete: false,
        }).populate("province");

        const wards = await XaPhuongBHXH.find({
            agency: id,
        });

        res.json({
            ...agency.toObject(),
            wards,
        });
    } catch (error) {
        throw new Error(error);
    }
});

//
// GET ALL
//
const getAllCoQuanBhxh = asyncHandler(async (req, res) => {
    try {
        const agencies = await CoQuanBHXH.find({
            isDelete: false,
        })
            .populate("province")
            .sort({
                agencyCode: 1,
            });

        res.json(agencies);
    } catch (error) {
        throw new Error(error);
    }
});

//
// SEARCH TẤT CẢ FIELD
//
const searchCoQuanBhxh = asyncHandler(async (req, res) => {
    try {
        const {
            keyword,
            provinceId,
            page = 1,
            limit = 20,
        } = req.query;

        const query = {
            isDelete: false,
        };

        if (provinceId) {
            query.province = provinceId;
        }

        if (keyword) {
            const wards = await XaPhuongBHXH.find({
                $or: [
                    {
                        wardName: {
                            $regex: keyword,
                            $options: "i",
                        },
                    },
                    {
                        wardCode: {
                            $regex: keyword,
                            $options: "i",
                        },
                    },
                ],
            }).select("agency");

            const agencyIds = wards.map(
                (item) => item.agency
            );

            query.$or = [
                {
                    agencyCode: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    agencyName: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    _id: {
                        $in: agencyIds,
                    },
                },
            ];
        }

        const data = await CoQuanBHXH.find(query)
            .populate("province")
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({
                agencyCode: 1,
            });

        const total = await CoQuanBHXH.countDocuments(query);

        res.json({
            total,
            page: Number(page),
            limit: Number(limit),
            data,
        });
    } catch (error) {
        throw new Error(error);
    }
});

//
// THEO TỈNH
//
const getCoQuanBhxhByProvince = asyncHandler(
    async (req, res) => {
        const { provinceId } = req.params;

        validateMongoDbId(provinceId);

        const data = await CoQuanBHXH.find({
            province: provinceId,
            isDelete: false,
        })
            .populate("province")
            .sort({
                agencyCode: 1,
            });

        res.json(data);
    }
);

//
// TRA CỨU THEO MÃ XÃ
//
const getByWardCode = asyncHandler(async (req, res) => {
    const { wardCode } = req.params;

    const ward = await XaPhuongBHXH.findOne({
        wardCode,
    })
        .populate({
            path: "agency",
            populate: {
                path: "province",
            },
        });

    res.json(ward);
});

//
// TRA CỨU THEO TÊN XÃ
//
const getByWardName = asyncHandler(async (req, res) => {
    const { wardName } = req.query;

    const data = await XaPhuongBHXH.find({
        wardName: {
            $regex: wardName,
            $options: "i",
        },
    }).populate({
        path: "agency",
        populate: {
            path: "province",
        },
    });

    res.json(data);
});

module.exports = {
    createCoQuanBhxh,
    updateCoQuanBhxh,
    deleteCoQuanBhxh,
    getCoQuanBhxh,
    getAllCoQuanBhxh,
    searchCoQuanBhxh,
    getCoQuanBhxhByProvince,
    getByWardCode,
    getByWardName,
};