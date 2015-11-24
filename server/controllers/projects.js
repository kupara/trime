(function() {
  'use strict';

  var Projects = require('../models').Projects;

  module.exports = {
    // Create a project
    create: function(req, res) {
      // The project title is required
      if (req.body.title === '' || req.params.org_id === '') {
        return res.status(400)
          .json({
            error: 'The project title is required'
          });
      } else {
        Projects.sync().then(function() {
            return Projects.create({
                title: req.body.title,
                description: req.body.description,
                org_id: req.params.org_id
              })
              .then(function(project) {
                return res.json(project);
              });
          })
          .catch(function(err) {
            return res.status(500).json({
              error: err.message
            });
          });
      }
    },

    all: function(req, res) {
      Projects.sync().then(function() {
          return Projects.findAll({
              where: {
                org_id: req.params.org_id
              }
            })
            .then(function(projects) {
              return res.json(projects);
            });
        })
        .catch(function(err) {
          return res.status(500).json({
            error: err.message
          });
        });
    },


  };
})();
