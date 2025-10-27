/**
 * JWT 토큰 생성 및 검증 유틸리티
 */

import jwt from 'jsonwebtoken';

/**
 * JWT 페이로드 인터페이스
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * JWT 토큰 생성
 * @param payload 토큰에 담을 사용자 정보
 * @returns JWT 토큰 문자열
 */
export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET 환경 변수가 설정되지 않았습니다.');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * JWT 토큰 검증
 * @param token JWT 토큰 문자열
 * @returns 디코딩된 페이로드 또는 null
 */
export const verifyToken = (token: string): JwtPayload | null => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET 환경 변수가 설정되지 않았습니다.');
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    // 토큰이 유효하지 않거나 만료됨
    return null;
  }
};

/**
 * Authorization 헤더에서 토큰 추출
 * @param authHeader Authorization 헤더 값 (예: "Bearer eyJhbGc...")
 * @returns 토큰 문자열 또는 null
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // "Bearer " 제거
};

