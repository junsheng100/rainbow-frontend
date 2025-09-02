<template>
  <div class="menu-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="search-item" style="float: left">
            <el-form-item prop="menuName" label="菜单名称">
              <el-input
                  v-model="queryParams.menuName"
                  placeholder="请输入菜单名称"
                  clearable
                  @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">
                <el-icon>
                  <Search/>
                </el-icon>
                搜索
              </el-button>
              <el-button @click="resetQuery">
                <el-icon>
                  <Refresh/>
                </el-icon>
                重置
              </el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 三列布局 -->
    <div class="menu-content">
      <!-- 目录树 -->
      <el-card class="menu-card catalog-tree" :style="{ width: catalogWidth + 'px' }">
        <template #header>
          <div class="card-header">
            <span>目录管理</span>
            <el-button type="success" :icon="Plus" @click="handleAddCatalog(null)">新增目录</el-button>
          </div>
        </template>
        <el-tree
            ref="catalogTreeRef"
            :data="catalogList"
            :props="{ label: 'menuName', children: 'children' }"
            highlight-current
            node-key="menuId"
            @node-click="handleCatalogClick"
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <span>
                <el-icon v-if="data.icon" class="mr-1">
                  <component :is="data.icon"/>
                </el-icon>
                {{ node.label }}
              </span>
              <span class="operation">
                <el-button link type="primary" @click.stop="handleAddCatalog(data)">新增</el-button>
                <el-button link type="primary" @click.stop="handleEdit(data)">编辑</el-button>
                <el-button link type="danger" @click.stop="handleDelete(data)">删除</el-button>
              </span>
            </div>
          </template>
        </el-tree>
      </el-card>

      <!-- 第一个拖动分割线 -->
      <div class="resizer" @mousedown="startResize($event, 'catalog')"></div>

      <!-- 菜单列表 -->
      <el-card class="menu-card menu-list">
        <template #header>
          <div class="card-header">
            <span>菜单管理</span>
            <el-button type="success" :icon="Plus" @click="handleAddMenu">新增菜单</el-button>
          </div>
        </template>
        <el-table
            ref="menuTableRef"
            v-loading="menuLoading"
            :data="menuList"
            style="width: 100%"
            :height="tableHeight"
            highlight-current-row
            @row-click="handleMenuClick"
        >
          <el-table-column prop="orderNum" label="排序" width="80" align="center"/>
          <el-table-column prop="menuName" label="菜单名称" width="120" show-overflow-tooltip>
            <template #default="{ row }">
              <el-icon v-if="row.icon" class="mr-1">
                <component :is="row.icon"/>
              </el-icon>
              {{ row.menuName }}
            </template>
          </el-table-column>

          <el-table-column prop="disabled" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.disabled === '0' ? 'success' : 'info'">
                {{ row.disabled === '0' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="visible" label="显示/隐藏" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.visible === '0' ? 'success' : 'info'">
                {{ row.visible === '0' ? '显示' : '隐藏' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click.stop="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 第二个拖动分割线 -->
      <div class="resizer" @mousedown="startResize($event, 'menu')"></div>

      <!-- 按钮列表 -->
      <el-card class="menu-card button-list">
        <template #header>
          <div class="card-header">
            <span>按钮管理</span>
            <el-button type="success" :icon="Plus" @click="handleAddButton">新增按钮</el-button>
          </div>
        </template>
        <el-table
            ref="buttonTableRef"
            v-loading="buttonLoading"
            :data="buttonList"
            style="width: 100%"
            :height="tableHeight"
        >
          <el-table-column prop="orderNum" label="排序" width="60" align="center"/>
          <el-table-column prop="menuName" label="按钮名称" min-width="120" show-overflow-tooltip/>

          <el-table-column label="上级菜单" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.parentName || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="perms" label="权限标识" show-overflow-tooltip/>
          <el-table-column prop="disabled" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.disabled === '0' ? 'success' : 'info'">
                {{ row.disabled === '0' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click.stop="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="520px"
        destroy-on-close
        @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="24">
          <el-col :span="22">
            <el-form-item label="上级菜单">
              <el-tree-select
                  v-model="form.parentId"
                  placeholder="请选择上级菜单"
                  clearable
                  @change="handleParentChange"
                  style="width: 100%"
                  :data="menuSelectData"
                  :props="{
                  label: 'menuName',
                  children: 'children',
                  disabled: (data: MenuItem) => (form.menuId && isChildOf(data, form.menuId)) ||
                                     (form.menuType === 'M' && data.menuType !== 'C') ||
                                     (form.menuType === 'F' && data.menuType !== 'M')
                }"
                  check-strictly
                  node-key="menuId"
              />
              <div class="form-tip" v-if="form.menuType === 'M'">
                <el-alert
                    title="请选择目录作为上级菜单"
                    type="warning"
                    :closable="false"
                />
              </div>
              <div class="form-tip" v-else-if="form.menuType === 'F'">
                <el-alert
                    title="请选择菜单作为上级菜单"
                    type="warning"
                    :closable="false"
                />
              </div>
              <div class="form-tip" v-else-if="form.menuType === 'C'">
                <el-alert
                    title="可以选择上级目录，不选择则为顶层目录"
                    type="info"
                    :closable="false"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22">
            <el-form-item
                :label="form.menuType === 'F' ? '按钮名称' : (form.menuType === 'M' ? '菜单名称' : '目录名称')"
                prop="menuName">
              <el-input v-model="form.menuName" :placeholder="getNamePlaceholder"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22">
            <template v-if="form.menuType !== 'F'">
              <el-form-item label="菜单图标">
                <IconSelect v-model="form.icon"/>
              </el-form-item>
              <el-form-item v-if="form.menuType === 'M'" label="路由名称">
                <el-input v-model="form.routeName" placeholder="请输入路由名称"/>
              </el-form-item>
              <el-form-item label="路由路径" prop="path">
                <el-input v-model="form.path" placeholder="请输入路由路径"/>
              </el-form-item>
              <el-form-item v-if="form.menuType === 'M'" label="组件路径" prop="component">
                <el-input v-model="form.component" placeholder="请输入组件路径"/>
              </el-form-item>

            </template>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22">
            <el-form-item v-if="form.menuType === 'F' || form.menuType === 'M'" label="请求地址">
              <div class="request-url-container">
                <el-input v-model="form.requestUrl" placeholder="请输入请求地址"/>
                <el-button type="primary" @click="openInterfaceSelector">选择</el-button>
              </div>
            </el-form-item>
            <el-form-item v-if="form.menuType === 'F' || form.menuType === 'M'" label="请求方法">
              <el-select v-model="form.requestMethod" placeholder="请选择请求方法" style="width: 100%">
                <el-option
                    v-for="method in requestMethods"
                    :key="method"
                    :label="method"
                    :value="method"
                />
              </el-select>
            </el-form-item>
            <el-form-item   label="权限标识" prop="perms">
              <el-input v-model="form.perms" placeholder="请输入权限标识"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="6">
            <el-form-item label="可用状态">
              <el-switch
                  v-model="form.disabled"
                  :active-value="'0'"
                  :inactive-value="'1'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="form.menuType === 'C' || form.menuType === 'M' ">
            <el-form-item label="显示状态">
              <el-switch
                  v-model="form.visible"
                  :active-value="'0'"
                  :inactive-value="'1'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if=" form.menuType === 'M' ">
            <el-form-item label="是否缓存">
              <el-switch
                  v-model="form.isCache"
                  :active-value="'0'"
                  :inactive-value="'1'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24" v-if="form.menuType === 'C' || form.menuType === 'M' ">
          <el-col :span="6" v-if="form.menuType === 'C' || form.menuType === 'M' ">
            <el-form-item label="是否外链">
              <el-switch
                  v-model="form.isFrame"
                  :active-value="'1'"
                  :inactive-value="'0'"
              />
            </el-form-item>
          </el-col>

        </el-row>
        <el-row :gutter="20">
          <el-col :span="22">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" :min="0" :max="999" controls-position="right"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 接口选择器组件 -->
    <InterfaceSelector
        v-model:visible="interfaceSelectorVisible"
        @select="handleInterfaceSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref, reactive, onMounted, computed, onBeforeUnmount, nextTick, watch} from 'vue';

// 请求方法选项
const requestMethods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
import {ElMessage, ElMessageBox} from 'element-plus';
import {Search, Plus, Refresh} from '@element-plus/icons-vue';
import type {FormInstance, FormRules} from 'element-plus';
import IconSelect from '@/components/IconSelect/index.vue';
import InterfaceSelector from '@/components/Appdoc/InterfaceSelector.vue';
import {InterfaceModel} from "@/types/appdoc.ts";
import {
  getMenuType,
  getChildList,
  createMenu,
  updateMenu,
  deleteMenu,
  getMenuInfo,
  type MenuItem,
  type MenuQuery
} from '@/api/system/menu';
import {handleError} from '@/utils/errorHandler'

// 查询参数
const queryParams = reactive<MenuQuery>({
  menuName: '',
  disabled: undefined
});

// 表格高度
const tableHeight = ref('calc(100vh - 280px)');

// 加载状态
const menuLoading = ref(false);
const buttonLoading = ref(false);

// 数据列表
const catalogList = ref<MenuItem[]>([]); // 目录树数据
const menuList = ref<MenuItem[]>([]); // 菜单列表数据
const buttonList = ref<MenuItem[]>([]); // 按钮列表数据

// 保存原始数据用于过滤
const originalMenuList = ref<MenuItem[]>([]); // 原始菜单列表数据
const originalButtonList = ref<MenuItem[]>([]); // 原始按钮列表数据

const catalogTreeData = ref<MenuItem[]>([]); // 目录树形选择数据
const menuTreeData = ref<MenuItem[]>([]); // 菜单树形选择数据

// 当前选中的目录和菜单
const currentCatalog = ref<MenuItem | null>(null);
const currentMenu = ref<MenuItem | null>(null);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref<FormInstance>();

// 接口选择器相关
const interfaceSelectorVisible = ref(false);
const form = reactive<MenuItem>({
  menuId: undefined,
  parentId: null,
  menuName: '',
  icon: '',
  path: '',
  component: '',
  query: '',
  requestUrl: '',
  requestMethod: '',
  interfaceId: '',
  routeName: '',
  orderNum: 1,
  menuType: 'C',
  perms: '',
  disabled: '0',
  visible: '0',
  isFrame: '0',
  isCache: '0'

});

// 表单校验规则
const rules = reactive<FormRules>({
  menuName: [{required: true, message: '请输入菜单名称', trigger: 'blur'}],
  parentId: [{
    required: true,
    validator: (_: any, value: any, callback: any) => {
      if (form.menuType !== 'C' && !value) {
        callback(new Error(form.menuType === 'M' ? '请选择上级目录' : '请选择上级菜单'));
      } else {
        callback();
      }
    },
    trigger: ['blur', 'change']
  }],
  orderNum: [{required: true, message: '请输入显示排序', trigger: 'blur'}]
});

// 获取名称输入框的占位符
const getNamePlaceholder = computed(() => {
  switch (form.menuType) {
    case 'C':
      return '请输入目录名称';
    case 'M':
      return '请输入菜单名称';
    case 'F':
      return '请输入按钮名称';
    default:
      return '请输入名称';
  }
});

// 对话框标题
const dialogTitle = computed(() => {
  const typeText = form.menuType === 'F' ? '按钮' : (form.menuType === 'M' ? '菜单' : '目录');
  return `${dialogType.value === 'add' ? '新增' : '编辑'}${typeText}`;
});

// 分割面板宽度
const catalogWidth = ref(300);
const menuWidth = ref(500);
let isResizing = false;
let currentResizer = '';

// 开始拖动
const startResize = (e: MouseEvent, type: 'catalog' | 'menu') => {
  isResizing = true;
  currentResizer = type;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopResize);
  e.preventDefault();
};

// 拖动中
const handleMouseMove = (e: MouseEvent) => {
  if (!isResizing) return;

  if (currentResizer === 'catalog') {
    const newWidth = e.clientX - 20; // 减去左侧padding
    if (newWidth >= 200 && newWidth <= 500) {
      catalogWidth.value = newWidth;
    }
  } else if (currentResizer === 'menu') {
    const catalogRight = catalogWidth.value + 20 + 5; // catalogWidth + padding + resizer
    const newWidth = e.clientX - catalogRight - 5; // 减去左侧resizer宽度
    if (newWidth >= 300 && newWidth <= 800) {
      menuWidth.value = newWidth;
    }
  }
};

// 停止拖动
const stopResize = () => {
  isResizing = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResize);
};

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResize);
});

// 表格引用
const catalogTreeRef = ref();
const menuTableRef = ref();
const buttonTableRef = ref();

// 将菜单列表转换为树形结构
const buildMenuTree = (menuList: MenuItem[], parentId: number | null = 0): MenuItem[] => {
  const result: MenuItem[] = [];
  // 使用Map来防止重复添加相同ID的菜单
  const menuMap = new Map<number, boolean>();

  menuList.forEach((menu: MenuItem) => {
    // 确保菜单ID存在且未被添加过
    if (menu.menuId && !menuMap.has(menu.menuId) && menu.parentId === parentId) {
      // 标记该菜单ID已被处理
      menuMap.set(menu.menuId, true);

      // 创建一个新对象，避免引用原始对象导致的副作用
      const menuCopy = {...menu};

      // 递归构建子菜单
      const children = buildMenuTree(menuList, menu.menuId);
      if (children.length > 0) {
        menuCopy.children = children;
      }

      result.push(menuCopy);
    }
  });

  return result;
};

// 获取目录树数据并自动选择第一个目录
const getCatalogList = async () => {
  try {
    const data = await getMenuType('C');

    catalogList.value = data;

    // 构建目录树形数据
    catalogTreeData.value = buildMenuTree(data);

    // 自动选择第一个目录并加载其菜单
    if (data.length > 0) {
      nextTick(() => {
        const firstCatalog = data[0];
        // 设置当前选中的目录节点
        if (catalogTreeRef.value) {
          catalogTreeRef.value.setCurrentKey(firstCatalog.menuId);
        }
        currentCatalog.value = firstCatalog;
        getMenuList(firstCatalog.menuId!);
      });
    }
  } catch (error) {
    handleError(error, '获取目录列表');
  }
};

// 获取菜单列表并自动选择第一行
const getMenuList = async (parentId: number) => {
  try {
    menuLoading.value = true;
    const data = await getChildList(parentId);
    const menuData = data.filter((item: MenuItem) => item.menuType === 'M'); // 只显示菜单类型
    menuList.value = menuData;
    originalMenuList.value = [...menuData]; // 保存原始数据

    // 获取所有菜单数据用于构建树形结构
    const allMenus = await getMenuType('M');
    // 构建菜单树形数据（包含目录和菜单）
    const allData = [...catalogList.value, ...allMenus];
    menuTreeData.value = buildMenuTree(allData);

    // 自动选择第一个菜单并加载其按钮
    if (menuData.length > 0) {
      nextTick(() => {
        const firstMenu = menuData[0];
        currentMenu.value = firstMenu;
        // 设置当前选中行
        if (menuTableRef.value) {
          menuTableRef.value.setCurrentRow(firstMenu);
        }
        getButtonList(firstMenu.menuId!);
      });
    } else {
      currentMenu.value = null;
      buttonList.value = [];
    }
  } catch (error) {
    handleError(error, '获取菜单列表');
  } finally {
    menuLoading.value = false;
  }
};

// 获取按钮列表
const getButtonList = async (parentId: number) => {
  try {
    buttonLoading.value = true;
    const data = await getChildList(parentId);
    const buttons = data.filter((item: MenuItem) => item.menuType === 'F'); // 只显示按钮类型

    // 获取当前菜单信息作为按钮的上级菜单
    if (currentMenu.value) {
      buttons.forEach((button: MenuItem) => {
        button.parentName = currentMenu.value?.menuName || '';
      });
    }

    buttonList.value = buttons;
    originalButtonList.value = [...buttons]; // 保存原始数据
  } catch (error) {
    handleError(error, '获取按钮列表');
  } finally {
    buttonLoading.value = false;
  }
};

// 查询
const handleQuery = () => {
  // 如果有查询条件，则根据条件过滤数据
  if (queryParams.menuName || queryParams.disabled !== undefined) {
    filterDataByQuery();
  } else {
    // 没有查询条件时，重新加载所有数据
    getCatalogList();
    if (currentCatalog.value) {
      getMenuList(currentCatalog.value.menuId!);
    }
    if (currentMenu.value) {
      getButtonList(currentMenu.value.menuId!);
    }
  }
};

// 根据查询条件过滤数据
const filterDataByQuery = () => {
  // 过滤菜单列表
  if (originalMenuList.value.length > 0) {
    const filteredMenus = originalMenuList.value.filter((menu: MenuItem) => {
      const nameMatch = !queryParams.menuName ||
        menu.menuName.toLowerCase().includes(queryParams.menuName.toLowerCase());
      const statusMatch = queryParams.disabled === undefined ||
        menu.disabled === queryParams.disabled;
      return nameMatch && statusMatch;
    });
    menuList.value = filteredMenus;
  }

  // 过滤按钮列表
  if (originalButtonList.value.length > 0) {
    const filteredButtons = originalButtonList.value.filter((button: MenuItem) => {
      const nameMatch = !queryParams.menuName ||
        button.menuName.toLowerCase().includes(queryParams.menuName.toLowerCase());
      const statusMatch = queryParams.disabled === undefined ||
        button.disabled === queryParams.disabled;
      return nameMatch && statusMatch;
    });
    buttonList.value = filteredButtons;
  }
};

// 重置查询
const resetQuery = () => {
  queryParams.menuName = '';
  queryParams.disabled = undefined;
  handleQuery();
};

// 点击目录节点
const handleCatalogClick = (data: MenuItem) => {
  currentCatalog.value = data;
  getMenuList(data.menuId!);
};

// 点击菜单行
const handleMenuClick = (row: MenuItem) => {
  currentMenu.value = row;
  getButtonList(row.menuId!);
};

// 菜单选择器数据
const menuSelectData = computed(() => {
  switch (form.menuType) {
    case 'F':
      // 按钮只能选择菜单('M')作为上级
      // 使用menuTreeData，它包含了所有的目录和菜单
      return menuTreeData.value;
    case 'M':
      // 菜单只能选择目录('C')作为上级
      // 使用catalogTreeData，它只包含目录
      return catalogTreeData.value;
    case 'C':
      // 目录可以选择目录('C')作为上级
      // 使用catalogTreeData，它只包含目录
      return catalogTreeData.value;
    default:
      return [];
  }
});


// 新增目录
const handleAddCatalog = async (parentNode: MenuItem | null) => {
  dialogType.value = 'add';
  resetForm();
  form.menuType = 'C';

  // 加载可选的上级目录
  try {
    const catalogs = await getMenuType('C');
    catalogList.value = catalogs;

    // 如果是从目录树节点点击新增，则设置该节点为上级目录
    if (parentNode) {
      form.parentId = parentNode.menuId;
      form.parentName = parentNode.menuName;
    }
  } catch (error) {
    handleError(error, '加载上级目录');
  }

  dialogVisible.value = true;
};

// 新增菜单
const handleAddMenu = async () => {
  if (!currentCatalog.value && form.menuType === 'M') {
    ElMessage.warning('请先选择一个目录作为上级菜单');
    return;
  }
  dialogType.value = 'add';
  resetForm();
  form.menuType = 'M';
  if (currentCatalog.value) {
    form.parentId = currentCatalog.value.menuId;
    form.parentName = currentCatalog.value.menuName;
  }
  dialogVisible.value = true;
};

// 新增按钮
const handleAddButton = async () => {
  if (!currentMenu.value) {
    ElMessage.warning('请先选择一个菜单');
    return;
  }
  dialogType.value = 'add';
  resetForm();
  form.menuType = 'F';
  form.parentId = currentMenu.value.menuId;
  form.parentName = currentMenu.value.menuName;
  dialogVisible.value = true;
};

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await createMenu(form);
          ElMessage.success('新增成功');
        } else {
          await updateMenu(form);
          ElMessage.success('修改成功');
        }
        dialogVisible.value = false;

        // 根据菜单类型和操作类型决定刷新哪一部分数据
        if (form.menuType === 'C') {
          // 如果是目录，只刷新目录树
          await getCatalogList();
          // 保持当前选中的目录
          if (currentCatalog.value) {
            nextTick(() => {
              if (catalogTreeRef.value) {
                catalogTreeRef.value.setCurrentKey(currentCatalog.value!.menuId);
              }
            });
          }
        } else if (form.menuType === 'M') {
          // 如果是菜单，刷新当前目录下的菜单列表
          if (currentCatalog.value) {
            await getMenuList(currentCatalog.value.menuId!);
            // 保持当前选中的菜单
            if (currentMenu.value) {
              nextTick(() => {
                if (menuTableRef.value) {
                  menuTableRef.value.setCurrentRow(currentMenu.value);
                }
              });
            }
          }
        } else if (form.menuType === 'F') {
          // 如果是按钮，需要找到按钮的父菜单并刷新按钮列表
          if (form.parentId) {
            await getButtonList(form.parentId);
          } else if (currentMenu.value) {
            await getButtonList(currentMenu.value.menuId!);
          }
        }

        // 如果有查询条件，重新应用过滤
        if (queryParams.menuName || queryParams.disabled !== undefined) {
          filterDataByQuery();
        }
      } catch (error) {
        handleError(error, '保存菜单');
      }
    }
  });
};

// 删除
const handleDelete = (row: MenuItem) => {
  ElMessageBox.confirm(`确认删除${row.menuName}吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
      .then(async () => {
        try {
          await deleteMenu(row.menuId!);
          ElMessage.success('删除成功');

          // 根据删除的项目类型决定刷新策略
          if (row.menuType === 'C') {
            // 删除目录，重新加载目录树
            await getCatalogList();
          } else if (row.menuType === 'M') {
            // 删除菜单，重新加载当前目录下的菜单列表
            if (currentCatalog.value) {
              await getMenuList(currentCatalog.value.menuId!);
            }
          } else if (row.menuType === 'F') {
            // 删除按钮，重新加载当前菜单下的按钮列表
            if (currentMenu.value) {
              await getButtonList(currentMenu.value.menuId!);
            }
          }

          // 如果有查询条件，重新应用过滤
          if (queryParams.menuName || queryParams.disabled !== undefined) {
            filterDataByQuery();
          }
        } catch (error) {
          handleError(error, '删除菜单');
        }
      })
      .catch(() => {
      });
};

// 处理上级菜单变化
const handleParentChange = async (value: number | null) => {
  if (value) {
    try {
      const menuInfo = await getMenuInfo(value);
      form.parentName = menuInfo.menuName;
    } catch (error) {
      handleError(error, '获取菜单信息');
      form.parentName = '';
    }
  } else {
    form.parentName = '';
  }
};

// 编辑
const handleEdit = async (row: MenuItem) => {
  dialogType.value = 'edit';
  try {
    const menuInfo = await getMenuInfo(row.menuId!);

    // 先设置菜单类型，这样可以触发正确的选项加载
    form.menuType = menuInfo.menuType;

    // 根据菜单类型加载可选的上级菜单
    if (menuInfo.menuType === 'M') {
      // 如果是菜单，加载目录列表
      const catalogs = await getMenuType('C');
      catalogList.value = catalogs;
    } else if (menuInfo.menuType === 'F') {
      // 如果是按钮，需要加载其所属目录下的菜单列表
      if (menuInfo.parentId) {
        const parentMenu = await getMenuInfo(menuInfo.parentId);
        // 设置上级菜单名称
        menuInfo.parentName = parentMenu.menuName;

        if (parentMenu.parentId) {
          const menus = await getChildList(parentMenu.parentId);
          menuList.value = menus.filter((item: MenuItem) => item.menuType === 'M');
        }
      }
    }

    // 设置表单其他字段
    Object.assign(form, menuInfo);

    // 兼容 parentId 为 null 或 0
    if (!menuInfo.parentId || menuInfo.parentId === 0) {
      form.parentId = null;
      form.parentName = '';
    } else {
      form.parentId = menuInfo.parentId;
      form.parentName = menuInfo.parentName || '';
    }
  } catch (error) {
    handleError(error, '获取菜单信息');
    Object.assign(form, row);
    if (!row.parentId || row.parentId === 0) {
      form.parentId = null;
      form.parentName = '';
    } else {
      form.parentId = row.parentId;
      // 如果是按钮，使用当前菜单的名称作为上级菜单名称
      if (row.menuType === 'F' && currentMenu.value && row.parentId === currentMenu.value.menuId) {
        form.parentName = currentMenu.value.menuName;
      } else {
        form.parentName = row.parentName || '';
      }
    }
  }
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(form, {
    menuId: undefined,
    parentId: null,
    parentName: '',
    menuName: '',
    icon: '',
    path: '',
    component: '',
    query: '',
    requestUrl: '',
    requestMethod: '',
    routeName: '',
    orderNum: 1,
    menuType: 'C',
    perms: '',
    disabled: '0',
    visible: '0'
  });
};


// 判断是否是某个节点的子菜单
const isChildOf = (menu: MenuItem, targetId: number): boolean => {
  if (menu.menuId === targetId) return true;
  if (menu.children?.length) {
    return menu.children.some(child => isChildOf(child, targetId));
  }
  return false;
};

// 监听菜单类型变化
watch(() => form.menuType, async (newType: 'C' | 'M' | 'F') => {
  // 切换菜单类型时，重新加载对应的上级菜单选项
  try {
    if (newType === 'C' || newType === 'M') {
      // 目录类型和菜单类型，都加载目录列表
      const catalogs = await getMenuType('C');
      catalogList.value = catalogs;
      // 构建目录树形数据
      catalogTreeData.value = buildMenuTree(catalogs);
    } else if (newType === 'F') {
      // 按钮类型，加载所有菜单数据
      const allMenus = await getMenuType('F');
      // 构建菜单树形数据（包含目录和菜单
      menuTreeData.value = buildMenuTree(allMenus);

      // 如果有当前目录，加载当前目录下的菜单列表
      if (currentCatalog.value) {
        const menus = await getChildList(currentCatalog.value.menuId!);
        menuList.value = menus.filter(item => item.menuType === 'M');
      }
    }
  } catch (error) {
    handleError(error, '加载上级菜单选项');
  }
});

// 初始化加载所有必要的数据
const initData = async () => {
  try {
    // 加载目录数据
    await getCatalogList();

    // 预加载菜单数据，用于构建菜单树形数据
    const [allMenus, allCatalogs] = await Promise.all([
      getMenuType('M'),
      getMenuType('C')
    ]);

    // 构建目录树形数据
    catalogTreeData.value = buildMenuTree(allCatalogs);

    // 构建菜单树形数据（包含目录和菜单）
    const allData = [...allCatalogs, ...allMenus];
    menuTreeData.value = buildMenuTree(allData);
  } catch (error) {
    handleError(error, '初始化数据');
  }
};

// 接口选择器相关方法
const openInterfaceSelector = () => {
  interfaceSelectorVisible.value = true;
};

const handleInterfaceSelect = (data: { baseUrl: string; interface: InterfaceModel }) => {
  // 拼接请求地址：基础路径 + 接口路径
  const fullUrl = data.baseUrl + data.interface.requestUrl;
  form.requestUrl = fullUrl;
  form.interfaceId = data.interface.id;
  form.requestMethod = data.interface.requestMethod;

  // 如果菜单名称或按钮名称为空，则自动填充为接口描述
  if (!form.menuName || form.menuName.trim() === '') {
    form.menuName = data.interface.description || '';
  }
  // 如果权限标识为空，则自动生成权限标识
  if (!form.perms || form.perms.trim() === '') {
    // 根据接口路径生成权限标识
    if (fullUrl.length > 0) {
      let fullPerms = fullUrl.replace(/\//g, ':')
          .replace(`$`, '')
          .replace(`{`, '')
          .replace(`}`, '');

      fullPerms = fullPerms.startsWith(":")?fullPerms.substring(1):fullPerms;
      form.perms =  fullPerms;
    }
  }

  interfaceSelectorVisible.value = false;
};

onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.menu-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .search-form {
    background-color: #fff;
    padding: 20px;
    margin-bottom: 0;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    :deep(.el-form-item) {
      margin-bottom: 0;
    }

    :deep(.el-form-item__content) {
      margin-right: 16px;
    }

    .el-button {
      margin-left: 8px;
    }
  }

  .menu-content {
    flex: 1;
    display: flex;
    gap: 0;
    min-height: 0;
    position: relative;
    user-select: none;

    .menu-card {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        overflow: auto;
      }

      &.catalog-tree {
        .custom-tree-node {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-right: 8px;

          .operation {
            display: none;
          }

          &:hover .operation {
            display: inline-flex;
            gap: 8px;
          }
        }
      }

      &.button-list {
        flex: 1;
      }
    }

    .resizer {
      width: 5px;
      background-color: transparent;
      cursor: col-resize;
      margin: 0 5px;
      position: relative;
      transition: background-color 0.2s;

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        height: 30px;
        width: 2px;
        background-color: var(--el-border-color);
        border-radius: 1px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover {
        background-color: var(--el-border-color-lighter);

        &::after {
          opacity: 1;
        }
      }

      &:active {
        background-color: var(--el-border-color-light);
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dialog-footer {
    text-align: right;
  }

  .request-url-container {
    display: flex;
    gap: 8px;

    .el-input {
      flex: 1;
    }

    .el-button {
      flex-shrink: 0;
    }
  }

  :deep(.el-switch) {
    .el-switch__core {
      .el-switch__inner {
        background-color: var(--el-color-primary);
      }

      &:hover {
        background-color: var(--el-color-info);
      }
    }

    &.is-checked {
      .el-switch__core {
        .el-switch__inner {
          background-color: var(--el-color-info);
        }

        &:hover {
          background-color: var(--el-color-primary);
        }
      }
    }
  }
}
</style>
