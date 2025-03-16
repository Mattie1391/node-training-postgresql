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

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if(!isValidString(id)) {
      next(appError(400, "欄位未填寫正確"))
      return
    }
    const userRepo = dataSource.getRepository('User')
    const findCoach = await userRepo.findOne({
      select: ['id', 'name'],
      where: {
        id,
        role: 'COACH'
      }
    })
    if(!findCoach) {
      next(appError(400, "找不到教練"))
      return
    }
    const coachRepo = dataSource.getRepository('Coach')
    const coach = await coachRepo.findOne({
      where: {
        user: {
          id: findCoach.id
        }
      }
    })

    res.status(200).json({
      status: "success",
      data: {
        user: {
          name: findCoach.name,
          role: findCoach.role
        },
        coach:{
            // {
            //     "status" : "success",
            //     "data": {
            //         "user": {
            //             "name": "test",
            //             "role": "COACH"
            //         },
            //         "coach": {
            //             "id": "1c8da31a-5fd2-44f3-897e-4a259e7ec62b",
            //             "user_id": "51feb472-a9b8-4365-b9a5-79b9594315a6",
            //             "experience_years" : 1,
            //             "description" : "瑜伽教練",
            //             "profile_image_url" : "https://...",
            //             "created_at": "2025-01-01T00:00:000Z",
            //             "updated_at": "2025-01-01T00:00:000Z"
            //         }
            //     }
            // }
          id: coach.id,
          user_id: coach.user_id,
          experience_years: coach.experience_years,
          description: coach.description,
          profile_image_url: coach.profile_image_url,
          created_at: coach.created_at,
          updated_at: coach.updated_at
        }
      }
    })
    } catch (error) {
        next(error)
    }
})

module.exports = router