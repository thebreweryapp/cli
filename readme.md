# @amberjs/cli

Amber.js CLI tool. Code generators for Amber.js Framework.

## Table of Contents

* [Usage](#usage)
* [Development](#development)
  * [Prerequisites](#prerequisites)
  * [Build](#Build)
* [Contributors](#contributors)
* [License](#license)

## Usage

This CLI tools is a helper for Amber.js Framework. It eases development workflow by generating codes and templates for Amber.js Framework.

You must be in the root directory of an Amber.js project generated using [@brewery/cli](https://gitlab.stratpoint.dev/thebrewery/brewery-cli).

```
Amber.js CLI v0.0.1

Commands:
  graphql:deploy            deploy resolver server using defined SDL
  scaffold                  scaffold infra, interface and domain based on swagger schema
  create:domain <name>      create domain base template
  create:appservice <name>  create app service base template
  create:datasource         create datasource wizard
  create:repository         create repository command
  create:model              create model command
  create:apiresource        create apiresource command
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



Example script for command action considering the following input from the CLI

```sh
binaryname samplecommand argValue --option1=value 
```


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
  // ['binaryname', 'samplecommand', 'argValue', '--option1=value']


  // Perform the action for your command ...

}

module.exports = commandAction;
```

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

this will create the executable files on project root directory

## Contributors

* Joshua Elijah Mante
* Ronald dela Cruz 
* James Levin Calado
* brewers@stratpoint.com

## License

[MIT](LICENSE) © Stratpoint Technologies Inc.








