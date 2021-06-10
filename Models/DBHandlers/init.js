const { Module } = require('module');
var database=require('./DBHandler')

async function  init(){
    await database.createPoll();
}

module.exports={
    init:init
}