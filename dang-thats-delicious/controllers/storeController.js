exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
}

exports.addStore = (req,res) => {
  // We reuse the same template for editing and adding stores
  res.render('editStore', {title: 'Add Store'});
}

exports.createStore = async (req,res) => {
  console.log(req.body)
  res.json(req.body);
}