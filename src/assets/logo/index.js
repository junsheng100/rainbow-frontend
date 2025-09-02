import Vue from 'vue'
import LogoIcon from '@/components/LogoIcon'// svg component

// register globally
Vue.component('logo-icon', LogoIcon)

const req = require.context('./logo', false, /\.png$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
