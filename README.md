# fluidefi-caspernet-wallet-tools
Includes tools for wallet operations: swap, add &amp; remove liquidity

# Requirements

Before you can run this application, please ensure that you have the dependencies mentionned [here](./docs/requirements.md) installed.

# Project Installation

To get started, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/fluidefi/fluidefi-caspernet-wallet-tools.git
   ```

2. Navigate to the project directory:
   ```sh
   cd fluidefi-caspernet-wallet-tools
   ```

3. Install the required dependencies:
   ```sh
   npm install
   ```

# Setting Up Environment Variables

The app relies on environment variables for configuration. Follow the steps below to set up the necessary environment variables.

## Step 1: Copy the `.env.example` File

In the root directory of the project, you will find a file named `.env.example`. This file serves as a template for thes environment variables. Begin by making a copy of this file and renaming it to `.env` by running this command.
```sh
$ cp .env.example .env
```

## Step 2: Edit the `.env` File

Open the `.env` file in a text editor and customize the values of the environment variables according to your specific configuration. Each variable represents a specific configuration option used by your app.

You can modify the values to match your desired configuration:
Make sure to provide the correct values for each variable based on your setup.
Make sure that the the `CASPERNET_PROVIDER_URL` variable has the URL to your node instead of the public Nodes that can be found on the test network.

## Step 3: Save the `.env` File

Save the changes you made to the `.env` file.


# Running the App

Once you have installed the dependencies, you can run the application using the following command:

```
npm start
```

This command will build and start the Node.js TypeScript app.

# Additional Commands

Here are some additional commands that you might find useful:

- `npm run build`: Builds the TypeScript source code.
- `npm test`: Runs the tests for the application.

# API Documentation 
You can find here the documentation for the endpoints of this app
https://documenter.getpostman.com/view/16177233/2s93kz76Gw#8efb4e80-6785-4d3f-9d1f-e3d1b84cd1ca