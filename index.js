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
//
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



const PORT = process.env.PORT || 7000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
