const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')

const { isValidString, isNumber } = require('../utils/validUtils')


router.post('/coaches/:userId', async (req, res, next) => {
  try {

    const { userId } = req.params   
    const { experience_years, description, profile_image_url } = req.body

    if (!isValidString(userId) || !isNumber(experience_years) || !isValidString(description)) {
      res.status(400).json({
        status : "failed",
        message: "欄位未填寫正確"
      })
      return
    }

    if (profile_image_url && isValidString(profile_image_url) && !profile_image_url.startsWith('https')) {
      res.status(400).json({
        status : "failed",
        message: "欄位未填寫正確"
      })
      return
    }

    const userRepo = dataSource.getRepository('User')
    const findUser = await userRepo.findOne({ 
      where: {
        id: userId
      } 
    })
    if (!findUser) {
      res.status(400).json({
        status : "failed",
        message: "使用者不存在"
      })  
      return
    } else if(findUser.role === 'COACH') {
      res.status(409).json({
        status : "failed",
        message: "使用者已經是教練"
      })  
      return
    }

    const updateUser = await userRepo.update({
      id: userId
    },{
      role: 'COACH'
    })
    if(updateUser.affected === 0){ // affected 0 代表沒有更新到資料
      res.status(400).json({
        status : "failed",
        message: "更新使用者失敗"
      })
      return
    }

    const coachRepo = dataSource.getRepository('Coach')
    const newCoach = coachRepo.create({ 
        user_id: userId,
        description,
        experience_years,
        profile_image_url
    })
    const coachResult = await coachRepo.save(newCoach)
    const userResult = await userRepo.findOne({
      where: {
        id: userId
      }
    })

    res.status(201).json({
      status: "success",
      data: {
        user: {
          name: userResult.name,
          role: userResult.role
        },
        coach: coachResult
      }
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
})



module.exports = router