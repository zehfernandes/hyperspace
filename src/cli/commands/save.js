const inquirer = require('inquirer')
const chalk = require('chalk')
const exec = require('child_process').exec
const path = require('path')
const { getAllProjects } = require('../../lib/projects')
const save = require('../../save/index')

module.exports = {
  description: 'Save a project',
  optionalArgs: 'projectName',
  handler(projectName) {
    if (projectName) {
      return save(projectName)
    }

    return askProjectName()
  },
}

function askProjectName() {
  return createOrOverwrite().then(getProjectName).then(saveProject)
}

function createOrOverwrite() {
  return inquirer.prompt({
    type: 'list',
    name: 'project',
    message: chalk.bold('Save project'),
    choices: function() {
      return [
        {
          name: chalk.bgGreen(chalk.black('+ Create new project')),
          value: 'new',
        },
        new inquirer.Separator('or overwrite:'),
        ...getAllProjects().map(project => project.replace('.json', '')),
      ]
    },
  })
}

function getProjectName({ project }) {
  if (project === 'new') {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Type the project name',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Type the project description',
      },
    ])
  }
  return { name: project }
}

function saveProject({ name, description }) {
  const setupPath = path.dirname(require.main.filename).replace('/cli', '')
  exec(`${setupPath}/configs/setup.sh`, function(error, stdout, stderr) {
    console.log(stdout)
    save(name, description)
  })
}
