const Redis = require("ioredis")
const redis = new Redis({
    port: 13022,
    host: "redis-13022.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com",
    password: "Cw3W72rxbpmqFCqu24Q8xjCl0S2cWO7W"
})

module.exports = redis