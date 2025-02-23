require("dotenv").config()
const http = require("http")
const AppDataSource = require("./db")

const isValidString = (value) => {
  return typeof value === 'string' && value.trim() !== '';
}

// 可增加其他檢查: 例如正整數
const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
}

const requestListener = async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json"
  }
  let body = ""
  req.on("data", (chunk) => {
    body += chunk
  })

  function returnSuccess (statusCode, statusString, data) {
    res.writeHead(statusCode, headers)
    res.write(JSON.stringify({
      status: statusString,
      data: data,
    }))
    res.end()
  }
  
  function returnError (statusCode, statusString, message) {
    res.writeHead(statusCode, headers)
    res.write(JSON.stringify({
      status: statusString,
      message: message,
    }))
    res.end()
  }  

  if (req.url === "/api/credit-package" && req.method === "GET") {
    try {
      const data = await AppDataSource.getRepository("CreditPackage").find({
        select: ['id', 'name', 'credit_amount', 'price']
      })
      returnSuccess (200, "success", data);
    } catch (error) {
      returnError (500, "error", "伺服器錯誤");
    }

  } else if (req.url === "/api/credit-package" && req.method === "POST") {
    req.on('end', async () => {
      try {
        const { name, credit_amount, price } = JSON.parse(body);
        if (!isValidString(name) || !isNumber(credit_amount) || !isNumber(price)) {
          returnError (400, "failed", "欄位未正確填寫");
          return;
        }

        const CreditPackage = AppDataSource.getRepository("CreditPackage");
        const findCreditPackage = await CreditPackage.find({
          where: { 
            name: name
          } 
        })
        if (findCreditPackage.length > 0) {
          returnError (409, "failed", "資料重複");
          return;
        }

        const newCreditPackage = CreditPackage.create({
          name,
          credit_amount,
          price
        })

        const result = await CreditPackage.save(newCreditPackage);

        returnSuccess (200, "success", result);  
      } catch (error) {
        returnError (500, "error", "伺服器錯誤");
      }
    })    
  } else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
    try {
      const createPackageId = req.url.split("/").pop();

      if (!isValidString(createPackageId)) {
        returnError (400, "failed", "ID錯誤");
        return;
      }

      const result = await AppDataSource.getRepository("CreditPackage").delete(createPackageId);
      if (result.affected === 0) {
        returnError (400, "failed", "ID錯誤");
        return;
      }
      
      returnSuccess (200, "success", createPackageId);
    } catch (error) {
      returnError (500, "error", "伺服器錯誤");
    }
  } else if (req.url === "/api/coaches/skill" && req.method === "GET") {
    try {
      const data = await AppDataSource.getRepository("Skill").find({
        select: ['id', 'name']
      })
      returnSuccess (200, "success", data);
    } catch (error) {
      returnError (500, "error", "伺服器錯誤");
    }
  } else if (req.url === "/api/coaches/skill" && req.method === "POST") {
    req.on('end', async () => {
      try {
        const { name } = JSON.parse(body);
        if (!isValidString(name)) {
          returnError (400, "failed", "欄位未正確填寫");
          return;
        }

        const skillRepo = AppDataSource.getRepository("Skill");
        const findSkill = await skillRepo.find({
          where: { 
            name: name
          } 
        })

        if (findSkill.length > 0) {
          returnError (409, "failed", "資料重複");
          return;
        }

        const newSkill = skillRepo.create({
          name
        })
        const result = await skillRepo.save(newSkill);

        returnSuccess (200, "success", result);
      } catch (error) {
        returnError (500, "error", "伺服器錯誤");
      }
    })
    
  } else if (req.url.startsWith("/api/coaches/skill/") && req.method === "DELETE") {
    try {
      const skillId = req.url.split("/").pop();
      if (!isValidString(skillId)) {
        returnError (400, "failed", "ID錯誤");
        return;
      }

      const result = await AppDataSource.getRepository("Skill").delete(skillId);
      if (result.affected === 0) {
        returnError (400, "failed", "ID錯誤");
        return;
      }

      returnSuccess (200, "success", skillId);
    } catch (error) {
      returnError (500, "error", "伺服器錯誤");
    }
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end()
  } else {
    returnError (404, "failed", "無此網站路由");
  }
}

const server = http.createServer(requestListener)

async function startServer() {
  await AppDataSource.initialize()
  console.log("資料庫連接成功")
  server.listen(process.env.PORT)
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
  return server;
}

module.exports = startServer();
