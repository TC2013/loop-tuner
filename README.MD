Prerequisites Install  
For mac os:  
Brew (https://brew.sh/):  
	Visual Studio Code (visual-studio-code) . 
	Node.js (node) .  
	Yarn (yarn):  
	TypeScript (typescript) . 

Guide I followed for basic setup stuff:  
https://www.typescriptlang.org/docs/handbook 

Set up your tsconfig.json file  
https://github.com/tsconfig/bases/ . 
Yarn configuration (running in the terminal in the directory):  
run "yarn add --dev packageName" to add npm packages to your package.json file automatically 
Package List: typescript, @tsconfig/recommended, gh-pages, parcel, cross-env 

Terminal commands:  
To install brew 
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" . 

To install Visual Studio Code, Node.js, Yarn, TypeScript (exclude any already downloaded):  
brew install visual-studio-code node yarn typescript 

Visual Studio Code Terminal Commands:  
Once the project is open in VSC, from the terminal:   
yarn install 
yarn start  
