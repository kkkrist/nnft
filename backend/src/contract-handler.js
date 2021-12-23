'use strict'

const origin =
  process.env.NODE_ENV === 'production'
    ? 'https://nnft.club/'
    : 'http://localhost:3002/'

const contractHandler = (req, res, next) =>
  res.send({
    name: '#NirvanaNFT',
    description: '#NirvanaNFT',
    image: `${origin}api/image/contract.png`,
    external_link: origin,
    seller_fee_basis_points: 1000,
    fee_recipient: process.env.OWNER
  })

module.exports = contractHandler
