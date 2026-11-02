import type { RouteObject } from 'react-router'
import { expect, it } from 'vitest'
import { PATHS } from './paths'
import { routes } from './router'

function collectPaths(list: RouteObject[]): string[] {
  return list.flatMap((route) => [...(route.path ? [route.path] : []), ...collectPaths(route.children ?? [])])
}

it('lists every page in PATHS, so the accessibility tests visit it', () => {
  const routePaths = collectPaths(routes).filter((path) => path !== '*')
  expect(new Set(routePaths)).toEqual(new Set(Object.values(PATHS)))
})
