const { initializeDatabase } = require("./db/db.connect");
const express = require("express");
const cors = require('cors')
const Lead = require("./model/lead.model");
const Comment = require("./model/comment.model");
const SalesAgent = require("./model/salesAgent.model");
const Tag = require("./model/tag.model");
const mongoose = require("mongoose");
const validator = require("validator");

require("dotenv").config();

const PORT = process.env.PORT;

initializeDatabase();

const app = express();
app.use(express.json())
app.use(cors())

app.listen(PORT, () => {
  console.log(`App is running on server ${PORT}`);
});

//Fetch leads data
app.get("/leads", async (req, res) => {
  try {
    const { salesAgent, status, source } = req.query;

    const allowedStatus = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed",
    ];

    const allowedSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Advertisement",
      "Email",
      "Other",
    ];

    // Validate salesAgent (if provided)
    if (salesAgent && !mongoose.Types.ObjectId.isValid(salesAgent)) {
      return res.status(400).json({
        error: "Invalid input: 'salesAgent' must be a valid ObjectId.",
      });
    }

    // Validate status (if provided)
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        error: `Invalid input: 'status' must be one of [${allowedStatus.join(
          ", "
        )}].`,
      });
    }

    // Validate source (if provided)
    if (source && !allowedSources.includes(source)) {
      return res.status(400).json({
        error: `Invalid input: 'source' must be one of [${allowedSources.join(
          ", "
        )}]. `,
      });
    }

    const leads = await Lead.find();

    if (leads.length > 0) {
      res.json(leads);
    } else {
      res.status(404).json({ error: "Lead Data not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads data." });
  }
});

//Post lead data
app.post("/leads", async (req, res) => {
  try {
    const { name, source, salesAgent, status, tags, timeToClose, priority } =
      req.body;

    //Check name
    if (!name) {
      return res
        .status(400)
        .json({ error: "Invalid input: 'name' is required." });
    }

    // Check if SalesAgent exists
    const agentExists = await SalesAgent.findById(salesAgent);
    if (!agentExists) {
      return res.status(400).json({
        error: `Sales agent with ID ${salesAgent} not found.`,
      });
    }

    // Create and save the lead
    const newLead = new Lead({
      name,
      source,
      salesAgent,
      status,
      tags,
      timeToClose,
      priority,
    });

    await newLead.save(); // Save to DB
    console.log(newLead);

    res
      .status(201)
      .json({ message: "New lead data added to the Database", lead: newLead });
  } catch (error) {
    console.error("Error in POST /leads:", error);
    res.status(500).json({ error: "Failed to post leads data.", error });
  }
});

//update lead data
app.post("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Lead ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Lead ID must be a valid ObjectId.",
      });
    }

    // Update lead and return the updated document
    const updateLeadData = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        error: `Lead with ID '${id}' not found.`,
      });
    }

    res.status(200).json({
      message: "Lead data updated successfully",
      lead: updateLeadData,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Failed to post leads data.", error });
  }
});

// delete lead data
app.delete("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleteLeadData = await Lead.findByIdAndDelete(req.params.id);

    if (!deleteLeadData) {
      return res.status(404).json({
        error: `Lead with ID '${id}' not found.`,
      });
    }

    res.status(200).json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lead data." });
  }
});

// add a comment to lead id
app.post("/leads/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;

    //find lead, Check if Lead exists
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        error: `Lead with ID '${id}' not found.`,
      });
    }

    //Create and save new comment
    const newComment = new Comment({ ...req.body, lead: id });
    await newComment.save(); // Save to DB
    res.status(201).json({
      message: "New comment added to the Lead",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment." });
  }
});

// get all comments to lead id
app.get("/leads/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find();

    if (comments.length > 0) {
      res.json(comments);
    } else {
      res.status(404).json({ error: "Comment Data not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments data." });
  }
});

//fetch agents data
app.get("/agents", async (req, res) => {
  try {
    const agents = await SalesAgent.find();

    if (agents.length > 0) {
      res.json(agents);
    } else {
      res.status(404).json({ error: "Sales Agent Data not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sales agents data." });
  }
});

//post agent data
app.post("/agents", async (req, res) => {
  try {
    const { email } = req.body;

    //Validate email format
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        error: "Invalid input: 'email' must be a valid email address.",
      });
    }

    //Check for existing sales agent with the same email
    const existingAgent = await SalesAgent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({
        error: `Sales agent with email '${email}' already exists.`,
      });
    }

    //Create and save new sales agent
    const newLead = new SalesAgent(req.body);
    await newLead.save(); // Save to DB

    res.status(201).json({
      message: "New sales agent added to the Database",
      lead: newLead,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Failed to post sales agent data." });
  }
});

//fetch tags data
app.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find();

    if (tags.length > 0) {
      res.json(tags);
    } else {
      res.status(404).json({ error: "Tag Data not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tags data." });
  }
});

//post tags data
app.post("/tags", async (req, res) => {
  try {
    const tags = new Tag(req.body);
    await tags.save(); // Save to DB

    res
      .status(201)
      .json({ message: "New tag data added to the Database", tags: tags });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Failed to post tags data." });
  }
});
