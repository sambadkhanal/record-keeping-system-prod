import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../helpers/cloudinary.helpers.js";
import Record from "../models/Record.model.js";

export const getRecords = async (req, res) => {
  try {
    // http://localhost:8080/api/record?name=S&is_npc=false&sort=race&select=name,age,race&page=1&limit=5
    // http://localhost:8080/api/record?numericFilters=age>40
    // http://localhost:8080/api/record?sort=-age (Descending age)

    const { name, race, is_npc, numericFilters, sort, select } = req.query;
    const queryObject = {};

    // ... Keyword filter for name field
    if (name) {
      queryObject.name = { $regex: name, $options: "i" }; // "i" means uppercase or lowercase results in same
    }

    if (race) {
      queryObject.race = race;
    }

    // ... Boolean check or filter true or false ones for is_npc
    if (is_npc) {
      queryObject.is_npc = is_npc === "true" ? true : false;
    }

    // Numeric Filtering: All you gotto do is add options
    // numericFilters=age>30,rating=5
    const options = ["age"]; // Insert our query params with numeric values
    if (numericFilters) {
      const operatorMap = {
        ">": "$gt",
        "<": "$lt",
        "=": "$eq",
        "<=": "$lte",
        ">=": "$gte",
      };

      const regEx = /(>=|<=|=|>|<)/g;
      let filters = numericFilters.replace(regEx, (match) => {
        return `-${operatorMap[match]}-`;
      });

      filters = filters.split(",");
      filters.forEach((item) => {
        const [field, operator, value] = item.split("-");

        if (options.includes(field)) {
          if (!queryObject[field]) {
            queryObject[field] = {};
          }

          queryObject[field][operator] = Number(value);
        }
      });
    }

    // ---------- YOUR JOB IS DONE ----------

    // Filter
    let results = Record.find(queryObject).lean();

    // SORT
    if (sort) {
      results = results.sort(sort.split(",").join(" ")); // "name,price" -> "name price"
    } else {
      results = results.sort("-createdAt"); // Latest will be on top
    }

    // SELECT
    if (select) {
      results = results.select(select.split(",").join(" ")); // Only selected fields will be shown
    }

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const totalDocuments = await Record.countDocuments(queryObject);

    results = results.skip(skip).limit(limit);

    const data = await results;

    res.status(200).json({
      data,
      pagination: {
        page,
        limit,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentDocumentCount: data.length,
      },
    });
  } catch (err) {
    console.log("Error occured in getRecords inside controller: ", err.stack);
    res.status(500).json({ msng: "Internal Server Error" });
  }
};

export const createRecord = async (req, res) => {
  try {
    const { name, gender, race, class_system, is_npc } = req.body;

    if (
      !name ||
      !gender ||
      !race ||
      !class_system ||
      is_npc === undefined ||
      !req.file
    ) {
      return res.status(400).json({
        msng: "All fields are required",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: "image",
    });

    const createdRecord = await Record.create({
      name,
      gender,
      race,
      class_system,
      is_npc: is_npc === "true",

      profile_pic: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });

    res.status(201).json({
      msng: "Record added successfully",
      createdRecord,
    });
  } catch (err) {
    console.log("Error occured in createRecord inside controller:", err.stack);

    res.status(500).json({
      msng: "Internal Server Error",
    });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ msng: "Record not found" });
    }

    // Delete the MongoDB record
    await Record.findByIdAndDelete(req.params.id);

    // Delete the profile picture from Cloudinary
    if (record.profile_pic?.public_id) {
      try {
        await deleteFromCloudinary(record.profile_pic.public_id);
      } catch (cloudinaryError) {
        console.error("Cloudinary image deletion failed:", cloudinaryError);
      }
    }

    res.status(200).json({
      msng: "Record deleted successfully",
      deletedRecord: record,
    });
  } catch (err) {
    console.log("Error occured in deleteRecord inside controller: ", err.stack);
    res.status(500).json({ msng: "Internal Server Error" });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        msng: "Record not found",
      });
    }

    // Update profile picture if a new one was uploaded
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type: "image",
      });

      // Delete old profile picture
      if (record.profile_pic?.public_id) {
        await deleteFromCloudinary(record.profile_pic.public_id);
      }

      // req.body will be our payload to update
      req.body.profile_pic = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const updatedRecord = await Record.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      msng: "Record updated successfully",
      updatedRecord,
    });
  } catch (err) {
    console.log("Error occured in updateRecord inside controller:", err.stack);

    res.status(500).json({
      msng: "Internal Server Error",
    });
  }
};

// !!! We haven't handled orphan images ie When image is uploaded to cloudinary but record is not created in database because of some errors
