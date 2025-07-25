const { initializeDatabase } = require("./db/db.connect");
const express = require("express");
const Lead = require("./model/lead.model");
const SalesAgent = require("./model/salesAgent.model");

require("dotenv").config();

const PORT = process.env.PORT;

initializeDatabase();

const app = express();
app.use(express.json());

app.listen(PORT, () => {
  console.log(`App is running on server ${PORT}`);
});

//Fetch leads data
app.get("/leads", async (req, res) => {
  try {
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
  console.log("in");
  try {
    const newLead = new Lead(req.body);
    await newLead.save(); // Save to DB

    res
      .status(201)
      .json({ message: "New lead data added to the Database", lead: newLead });
  } catch (error) {
    res.status(500).json({ message: "Failed to post leads data." });
  }
});

//update lead data
app.post("/leads/:id", async (req, res) => {
  console.log("req", req.params);
  try {
    const updateLeadData = await Lead.findByIdAndUpdate(req.params.id);
    if (updateLeadData) {
      res.status(200).json({
        message: "Lead data updated successfully",
        lead: updateLeadData,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to post leads data.", error });
  }
});

//fetch agents data
app.get("/agents", async (req, res) => {
  try {
    const agents = await SalesAgent.find();

    if (agents.length > 0) {
      res.json(agents);
    } else {
      res.status(404).json({ error: "Agent Data not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch agents data." });
  }
});

//post agent data
app.post("/agents", async (req, res) => {
  try {
    const newLead = new SalesAgent(req.body);
    await newLead.save(); // Save to DB

    res
      .status(201)
      .json({ message: "New lead data added to the Database", lead: newLead });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Failed to post leads data." });
  }
});
