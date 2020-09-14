const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cons = require("consolidate");
const dust = require("dustjs-helpers");
const { Pool } = require("pg");
const app = express();


const connectionString = 'postgresql://qc:sidPAREKH@1234@localhost:5432/qc_datatbase';
const pool = new Pool({
  connectionString: connectionString,
})
app.engine("dust", cons.dust);

app.set("view engine", "dust");
app.set("views", __dirname + "/views");

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  pool.query('SELECT patient.name, patient.id , testing.testing_type, testing.results FROM patient LEFT JOIN testing ON patient.id = testing.id', (err, result) => {
    if(err){
      console.log("bc dimaag kharab kiya ye error")
    }
    res.render("index", { patient: result.rows });
  })
});

app.post("/bed_count", function (req, res) {
  pool.query('SELECT * FROM bed WHERE bed_type = $1',['ICU'], (err, result) => {
    if(err){
      console.log("bc dimaag kharab kiya ye error")
    }
    pool.query('SELECT * FROM bed WHERE bed_type = $1',['normal'], (err, result_normal) => {
      if(err){
        console.log("bc dimaag kharab kiya ye error")
      }
      pool.query('SELECT * FROM bed WHERE bed_type = $1',['ventilator'], (err, result_ventilator) => {
        if(err){
          console.log("bc dimaag kharab kiya ye error")
        }
        console.log(result.rows.length)
        console.log(result_normal.rows.length)
        console.log(result_ventilator.rows.length)
        res.render("index", { bed_count: result.rows, ICU: parseInt(result.rows.length), normal: parseInt(result_normal.rows.length), ventilator: parseInt(result_ventilator.rows.length) });
      });
    });
  });
});

app.post('/add', function(req, res){
  pool.query("INSERT INTO patient(name, dob) VALUES($1, $2)",
  [req.body.name, req.body.dob]);
  res.redirect('/');
});

app.post('/search', function(req, res){
   const query = {
    name: 'fetch-user',
    text: 'SELECT * FROM patient WHERE id = $1',
    values: [req.body.id]
  }
  pool.query(query, (err, result) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(result.rows[0])
    }
    res.render("index", {testing: result.rows[0]});
  });
});
app.post('/test_add', function(req, res){
  pool.query("INSERT INTO testing(id, testing_type, results) VALUES($1, $2, $3)",
  [req.body.id, req.body.testing_type, req.body.results]);
  res.redirect('/');
});

app.post('/bed_assign', function(req, res){
  pool.query("INSERT INTO bed(id, bed_type) VALUES($1, $2)",
  [req.body.id, req.body.bed_type]);
  res.redirect('/');
});

app.post('/admitted', function(req, res){
  pool.query('SELECT bed.id, bed.bed_type, testing.id, testing.results FROM bed INNER JOIN testing ON bed.id= testing.id WHERE testing.results = $1',['pos'], function(err, result){
    if(err){
      console.log('err')
    }
    console.log(result)
    res.render("index", {admitted: result.rows})
  })
});

app.post('/discharge', function(req, res){
  pool.query('SELECT testing.id, testing.results, patient.name, patient.id FROM testing INNER JOIN patient ON patient.id = testing.id WHERE testing.results = $1',['neg'],function(err, result){
    if(err){
      console.log('err')
    }
    console.log(result)
    res.render("index", {discharge: result.rows})
  })
})


const PORT = process.env.PORT || 7000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
