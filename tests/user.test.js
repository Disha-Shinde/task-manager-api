const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, userOneId, setupDatabase  } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async() => {
    const response = await request(app).post('/users').send({
        name: 'Disha',
        email: 'disha@gmail.com',
        password: 'dishashinde!'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertiions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Disha',
            email: 'disha@gmail.com'
        },
        token: user.tokens[0].token
    })

    // Not plaintext password
    expect(user.password).not.toBe('dishashinde')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non-existent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'sadadfeesde'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account unauthenticated for user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatars', 'tests/fixtures/profile.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should upload valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Harvey'
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Harvey')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'New York'
        })
        .expect(400)
})