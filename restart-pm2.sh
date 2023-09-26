#!/bin/bash

# Change to your repository directory
cd ~/personal-website

# Pull the latest changes from the main branch
git pull origin main

# Restart your PM2 program
pm2 restart lumap/personal-website