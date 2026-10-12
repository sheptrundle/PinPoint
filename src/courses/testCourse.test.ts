import { describe, expect, it } from 'vitest'
import { validateCourse } from '../game/course'
import { testCourse } from './testCourse'

describe('testCourse', () => {
  it('is a valid course', () => {
    expect(validateCourse(testCourse)).toEqual([])
  })
})
