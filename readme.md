# brewery-cli

CLI tool for stratpoint brewery framework (https://gitlab.stratpoint.com/thebrewery/node-api-boilerplate)

## Table of Contents

* [Prerequisites](#prerequisites)
* [Build](#Build)
* [Usage](#usage)
* [Development](#development)
* [Contributors](#contributors)
* [License](#license)

## Prerequisites
Install ```pkg``` for creating executable files
```sh
npm install -g pkg
```

## Build
To build executable file for all platforms (Windows, Linux, Macos) run:
```sh
npm run build
```
  or

```sh
 pkg package.json
```

this will create the executable files on brewery-cli root directory

## Usage

/path/to/executable ```<command>``` --options


```

Brewery CLI v1.0.0

Commands:
  init                              initialize project
  scaffold                          scaffold domain, models, repositories, routes, controllers, service/operation out of swagger specs

DB commands for backend:
  db:migrate                        Run pending migrations
  db:migrate:schema:timestamps:add  Update migration table to have timestamps
  db:migrate:status                 List the status of all migrations
  db:migrate:undo                   Reverts a migration
  db:migrate:undo:all               Revert all migrations ran
  db:seed                           Run specified seeder
  db:seed:undo                      Deletes data from the database
  db:seed:all                       Run every seeder
  db:seed:undo:all                  Deletes data from the database
  db:create                         Create database specified by configuration
  db:drop                           Drop database specified by configuration
  db:init                           Initializes project
  db:init:config                    Initializes configuration
  db:init:migrations                Initializes migrations
  db:init:models                    Initializes models
  db:init:seeders                   Initializes seeders
  db:migration:generate             Generates a new migration file
  db:model:generate                 Generates a model and its migration  
  db:seed:generate                  Generates a new seed file                            

```

## Development

Creating commands:

Example command configuration:

Single command in one JSON file:
```json
{
    "command": "command <!arg1> <arg2>",
    "description": "command description",
    "usage": "command arg1 --option=value ",
    "options": {
        "option1": {
            "description": "option1 description",
            "default" : true,
            "value": "required"
        },
        "option2": {
            "description": "option2 description"
        },
        "option3": {
            "description": "option3 description"
        }
    },
    "execPath": "./actions/command/"
}
```

Multiple commands in one JSON file:

```json
[
  {
    "command": "namespace:command1 <!arg1> <arg2>",
    "description": "namespace:command1 description",
    "usage": "namespace:command1 --options=value ",
    "options": {
        "option1": {
            "description": "option1 description",
            "default" : true,
            "value": "required"
        },
        "option2": {
            "description": "option2 description"
        },
        "option3": {
            "description": "option3 description"
        }
    },
    "execPath": "./actions/namespace/"
  },
  {
    "command": "namespace:command2",
    "description": "namespace:command2 description",
    "usage": "namespace:command2 --options",
    "options": {
        "option1": {
            "description": "option1 description",
            "default" : true,
            "value": "required"
        },
        "option2": {
            "description": "option2 description"
        },
        "option3": {
            "description": "option3 description"
        }
    },
    "execPath": "./actions/namespace/"
  }
]

```

To create commands for CLI, create new json file on ```src/configs/your_command.json```. The config json will automatically be loaded by the CLI.

- ```command```: Name of the command. Expected arguments for the command should be enclosed in "```< >```" eg. ```"<arg1>"```, if an argument is required it should be enclosed in ```"<! >"``` eg. ```"<!arg2>"```
- ```description```: description of the command
- ```usage```: example usage of the command
- ```options```: available options for the command
  - ```default```: set to true if option should be enabled by default.
  - ```value```: set to required if a value for the option is required.
- ```execPath```: should contain the path to the script that will perform the action of your command, you may place your scripts on src/actions for uniformity
- your ```execPath``` should return a function that requires 3 parameters for (config , command, args)



Example script for command action considering the following input from the CLI "``` brewery samplecommand argValue --option1=value ```":
```js

const commandAction = (config, command, args) => {

  console.log(config); // contains config of your command loaded from the JSON file
  /*
    {
      "command": "samplecommand <!arg1> <arg2>",
      "description": "samplecommand description",
      "usage": "samplecommand --options=value ",
      "options": {
          "option1": {
              "description": "option1 description",
              "default" : true,
              "value": "required"
          },
          "option2": {
              "description": "option2 description"
          },
          "option3": {
              "description": "option3 description"
          }
      },
      "execPath": "./actions/samplecommand/"
    },
  */

 console.log(command); // contains organized data based on parsed input from cli
 /*
    {
      name: samplecommand
      args: {
        arg1: "argValue",
        arg2: null
      }
      options: {
          "option1": {
            value: "value"
          },
          "option2": null,
          "option3": null
      }
    }
 */

  console.log(args) // contains array of raw arguments inputted on the cli
  // ['brewery', 'samplecommand', 'argValue', '--option1=value']


  // Perform the action for your command ...

}

module.exports = commandAction;
```






## Contributors

* Joshua Elijah Mante
* Ronald dela Cruz

## License

[MIT](LICENSE) © Stratpoint Technologies Inc.








