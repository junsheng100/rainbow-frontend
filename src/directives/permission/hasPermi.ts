import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * v-hasPermi 操作权限处理
 * 使用方式：
 * 1. 单个权限: v-hasPermi="'system:user:add'"
 * 2. 多个权限: v-hasPermi="['system:user:add', 'system:user:edit']"
 * 3. 指定逻辑: v-hasPermi.or="['system:user:add', 'system:user:edit']"
 *    默认为 and 逻辑，即需要同时具有所有权限
 *    使用 or 修饰符时，具有任一权限即可
 */
export const hasPermi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, modifiers } = binding
    const userStore = useUserStore()
    
    const checkPermission = () => {
      const permissions = userStore.permissions || []

      const hasPermission = (permissionValues: string | string[]): boolean => {
        if (!permissionValues) {
          return false
        }

        const permissionArray = Array.isArray(permissionValues) ? permissionValues : [permissionValues]

        if (permissionArray.length === 0) {
          return false
        }

        // 检查是否具有通配符权限
        const hasWildcardPermission = permissions.some(perm => perm === '*:*:*' || perm === '*')

        // 使用 or 修饰符时，具有任一权限即可
        if (modifiers.or) {
          return permissionArray.some(permission => {
            // 如果有通配符权限，直接返回true
            if (hasWildcardPermission) {
              return true
            }
            return permissions.includes(permission)
          })
        }

        // 默认为 and 逻辑，需要同时具有所有权限
        return permissionArray.every(permission => {
          // 如果有通配符权限，直接返回true
          if (hasWildcardPermission) {
            return true
          }
          return permissions.includes(permission)
        })
      }

      if (!hasPermission(value)) {
        if (el.parentNode && el.parentNode.contains(el)) {
          el.parentNode.removeChild(el)
        }
      }
    }

    // 立即检查一次
    checkPermission()

    // 如果权限为空，等待权限加载完成后再检查
    if (!userStore.permissions.length) {
      userStore.getUserInfo().then(() => {
        checkPermission()
      }).catch(() => {
        checkPermission()
      })
    }
  }
}

/**
 * v-hasAnyPermi 操作权限处理
 * 使用方式：v-hasAnyPermi="['system:user:add', 'system:user:edit']"
 * 只要具有其中任意一个权限即可
 */
export const hasAnyPermi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions || []

    const hasPermission = (permissionValues: string[]): boolean => {
      if (!Array.isArray(permissionValues) || permissionValues.length === 0) {
        return false
      }

      // 检查是否具有通配符权限
      const hasWildcardPermission = permissions.some(perm => perm === '*:*:*' || perm === '*')
      if (hasWildcardPermission) {
        return true
      }

      return permissionValues.some(permission => permissions.includes(permission))
    }

    if (!hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * v-hasNoPermi 操作权限处理
 * 使用方式：v-hasNoPermi="['system:user:add', 'system:user:edit']"
 * 没有这些权限时才显示
 */
export const hasNoPermi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions || []

    const hasPermission = (permissionValues: string[]): boolean => {
      if (!Array.isArray(permissionValues) || permissionValues.length === 0) {
        return false
      }

      // 检查是否具有通配符权限
      const hasWildcardPermission = permissions.some(perm => perm === '*:*:*' || perm === '*')
      if (hasWildcardPermission) {
        return true
      }

      return permissionValues.some(permission => permissions.includes(permission))
    }

    if (hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * v-hasRole 角色权限处理
 * 使用方式：
 * 1. 单个角色: v-hasRole="'admin'"
 * 2. 多个角色: v-hasRole="['admin', 'editor']"
 * 3. 指定逻辑: v-hasRole.or="['admin', 'editor']"
 *    默认为 and 逻辑，即需要同时具有所有角色
 *    使用 or 修饰符时，具有任一角色即可
 */
export const hasRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, modifiers } = binding
    const userStore = useUserStore()
    const roles = userStore.roles || []

    const hasRole = (roleValues: string | string[]): boolean => {
      if (!roleValues) {
        return false
      }

      const roleArray = Array.isArray(roleValues) ? roleValues : [roleValues]

      if (roleArray.length === 0) {
        return false
      }

      // 检查是否具有通配符角色
      const hasWildcardRole = roles.some(role => role === '*:*:*' || role === '*')
      if (hasWildcardRole) {
        return true
      }

      // 使用 or 修饰符时，具有任一角色即可
      if (modifiers.or) {
        return roleArray.some(role => roles.includes(role))
      }

      // 默认为 and 逻辑，需要同时具有所有角色
      return roleArray.every(role => roles.includes(role))
    }

    if (!hasRole(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}
