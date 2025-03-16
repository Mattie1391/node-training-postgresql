const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Coaches')
const { isValidString } = require('../utils/validUtils')
const appError = require('../utils/appError')

router.get('/', async (req, res, next) => {
  try {
    const{per, page } = req.query
    if(!isValidString(per) || !isValidString(page)) {
      next(appError(400, "欄位未填寫正確"))
      return
    }
    // 這邊的 per 和 page 都是字串，要轉成數字
    const perNum = parseInt(per)
    const pageNum = parseInt(page)
    const couchRepo = dataSource.getRepository('User')
    const couches = await couchRepo.find({
      select: ['id', 'name'],
      where: {
        role: 'COACH'
      },
      skip: perNum * (pageNum - 1),
      take: perNum
    })
    const coachResult = coaches.map(coach => {
      return {
        id: coach.id,
        name: coach.name
    }
    })

    res.status(200).json({
    status: "success",
    data: coachResult
    })
    } catch (error) {
        next(error)
    }
})
module.exports = router