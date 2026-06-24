const SalesRecord = require("../models/salesRecordModel");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const validateMongoDbId = require("../utils/validateMongodbId");

const createSalesRecord = asyncHandler(async (req, res) => {
  const record = await SalesRecord.create(req.body);

  res.status(201).json({
    success: true,
    data: record,
  });
});

const updateSalesRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  const record = await SalesRecord.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
    }
  );

  res.json({
    success: true,
    data: record,
  });
});

const deleteSalesRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  const record = await SalesRecord.findByIdAndUpdate(
    id,
    {
      isDelete: true,
      status: false,
    },
    {
      new: true,
    }
  );

  res.json({
    success: true,
    data: record,
  });
});

const getSalesRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  const record = await SalesRecord.findById(id)
    .populate("userId", "-password");

  res.json({
    success: true,
    data: record,
  });
});

const getAllSalesRecord = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
  } = req.query;

  const skip = (page - 1) * limit;

  const data = await SalesRecord.find({
    isDelete: false,
  })
    .populate("userId", "-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await SalesRecord.countDocuments({
    isDelete: false,
  });

  res.json({
    success: true,
    total,
    page: Number(page),
    data,
  });
});

const searchSalesRecord = asyncHandler(async (req, res) => {
  const {
    keyword = "",
    productType,
    sourceType,
    userId,
  } = req.query;

  const query = {
    isDelete: false,
  };

  if (productType) {
    query.productType = productType;
  }

  if (sourceType) {
    query.sourceType = sourceType;
  }

  if (userId) {
    query.userId = userId;
  }

  const data = await SalesRecord.find(query)
    .populate("userId", "-password")
    .sort({
      createdAt: -1,
    });

  res.json({
    success: true,
    data,
  });
});

const getByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const data = await SalesRecord.find({
    userId,
    isDelete: false,
  })
    .populate("userId", "-password")
    .sort({
      createdAt: -1,
    });

  res.json({
    success: true,
    data,
  });
});

const dashboardSales = asyncHandler(async (req, res) => {
  const result = await SalesRecord.aggregate([
    {
      $match: {
        isDelete: false,
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$revenue",
        },
        totalCustomers: {
          $sum: "$customerCount",
        },
        totalProducts: {
          $sum: "$productQuantity",
        },
      },
    },
  ]);

  res.json({
    success: true,
    data: result[0] || {},
  });
});

const getCalendarRevenue = asyncHandler(async (req, res) => {try {
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const result = await SalesRecord.aggregate([
      {
        $match: {
          reportDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$reportDate",
            },
          },
          totalRevenue: {
            $sum: "$revenue",
          },
          totalCustomers: {
            $sum: "$customerCount",
          },
          totalProducts: {
            $sum: "$productQuantity",
          },
          totalRecords: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }});

  const getRevenueByDay = asyncHandler(async (req, res) => {
    try {
    const { date } = req.query;

    const start = new Date(date);
    const end = new Date(date);

    end.setDate(end.getDate() + 1);

    const records = await SalesRecord.find({
      reportDate: {
        $gte: start,
        $lt: end,
      },
    }).populate("userId");

    const summary = await SalesRecord.aggregate([
      {
        $match: {
          reportDate: {
            $gte: start,
            $lt: end,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$revenue",
          },
          totalCustomers: {
            $sum: "$customerCount",
          },
          totalProducts: {
            $sum: "$productQuantity",
          },
          totalRecords: {
            $sum: 1,
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      summary: summary[0] || {},
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  });

module.exports = {
  createSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
  getSalesRecord,
  getAllSalesRecord,
  searchSalesRecord,
  getByUser,
  dashboardSales,
  getCalendarRevenue,
  getRevenueByDay
};