export const jwtConstants = {
  jwtSecret: process.env.JWT_SECRET_KEY,
  refreshTokenSecret: process.env.JWT_SECRET_KEY,
  customerJwtSecret: process.env.CUSTOMER_JWT_SECRET_KEY,
}

export const CUSTOMER_JWT_SERVICE = 'CUSTOMER_JWT_SERVICE'