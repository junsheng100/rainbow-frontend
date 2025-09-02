<template>
  <div class="cron-expression">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="秒" name="second">
        <div class="cron-tab-content">
          <el-radio-group v-model="cronConfig.second.type" @change="updateCron">
            <el-radio label="every">每秒 允许的通配符[,-*/]</el-radio>
            <el-radio label="cycle">周期</el-radio>
            <el-radio label="start">从...秒开始,每...秒执行一次</el-radio>
            <el-radio label="specify">指定</el-radio>
          </el-radio-group>
          
          <div v-if="cronConfig.second.type === 'cycle'" class="cron-input-group">
            <span>从</span>
            <el-input-number v-model="cronConfig.second.start" :min="0" :max="59" @change="updateCron" />
            <span>-</span>
            <el-input-number v-model="cronConfig.second.end" :min="0" :max="59" @change="updateCron" />
            <span>秒</span>
          </div>
          
          <div v-if="cronConfig.second.type === 'start'" class="cron-input-group">
            <span>从</span>
            <el-input-number v-model="cronConfig.second.start" :min="0" :max="59" @change="updateCron" />
            <span>秒开始,每</span>
            <el-input-number v-model="cronConfig.second.interval" :min="1" :max="59" @change="updateCron" />
            <span>秒执行一次</span>
          </div>
          
          <div v-if="cronConfig.second.type === 'specify'" class="cron-checkbox-grid">
            <div class="grid-title">指定秒数：</div>
            <div class="checkbox-grid">
              <el-checkbox 
                v-for="i in 60" 
                :key="i-1" 
                v-model="cronConfig.second.specified[i-1]"
                @change="updateCron"
              >
                {{ String(i-1).padStart(2, '0') }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="分钟" name="minute">
        <div class="cron-tab-content">
          <el-radio-group v-model="cronConfig.minute.type" @change="updateCron">
            <el-radio label="every">每分钟 允许的通配符[,-*/]</el-radio>
            <el-radio label="cycle">周期</el-radio>
            <el-radio label="start">从...分钟开始,每...分钟执行一次</el-radio>
            <el-radio label="specify">指定</el-radio>
          </el-radio-group>
          
          <div v-if="cronConfig.minute.type === 'cycle'" class="cron-input-group">
            <span>从</span>
            <el-input-number v-model="cronConfig.minute.start" :min="0" :max="59" @change="updateCron" />
            <span>-</span>
            <el-input-number v-model="cronConfig.minute.end" :min="0" :max="59" @change="updateCron" />
            <span>分钟</span>
          </div>
          
          <div v-if="cronConfig.minute.type === 'start'" class="cron-input-group">
            <span>从</span>
            <el-input-number v-model="cronConfig.minute.start" :min="0" :max="59" @change="updateCron" />
            <span>分钟开始,每</span>
            <el-input-number v-model="cronConfig.minute.interval" :min="1" :max="59" @change="updateCron" />
            <span>分钟执行一次</span>
          </div>
          
          <div v-if="cronConfig.minute.type === 'specify'" class="cron-checkbox-grid">
            <div class="grid-title">指定分钟：</div>
            <div class="checkbox-grid">
              <el-checkbox 
                v-for="i in 60" 
                :key="i-1" 
                v-model="cronConfig.minute.specified[i-1]"
                @change="updateCron"
              >
                {{ String(i-1).padStart(2, '0') }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="小时" name="hour">
        <div class="cron-tab-content">
          <el-radio-group v-model="cronConfig.hour.type" @change="updateCron">
            <el-radio label="every">每小时 允许的通配符[,-*/]</el-radio>
            <el-radio label="cycle">周期</el-radio>
            <el-radio label="start">从...小时开始,每...小时执行一次</el-radio>
            <el-radio label="specify">指定</el-radio>
          </el-radio-group>
          
          <div v-if="cronConfig.hour.type === 'cycle'" class="cron-input-group">
            <span>从</span>
            <el-input-number v-model="cronConfig.hour.start" :min="0" :max="23" @change="updateCron" />
            <span>-</span>
            <el-input-number v-model="cronConfig.hour.end" :min="0" :max="23" @change="updateCron" />
            <span>小时</span>
          </div>
          
          <div v-if="cronConfig.hour.type === 'start'" class="cron-input-group">
            <span>从</span>
            <el-input-number v-model="cronConfig.hour.start" :min="0" :max="23" @change="updateCron" />
            <span>小时开始,每</span>
            <el-input-number v-model="cronConfig.hour.interval" :min="1" :max="23" @change="updateCron" />
            <span>小时执行一次</span>
          </div>
          
          <div v-if="cronConfig.hour.type === 'specify'" class="cron-checkbox-grid">
            <div class="grid-title">指定小时：</div>
            <div class="checkbox-grid">
              <el-checkbox 
                v-for="i in 24" 
                :key="i-1" 
                v-model="cronConfig.hour.specified[i-1]"
                @change="updateCron"
              >
                {{ String(i-1).padStart(2, '0') }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="日" name="day">
        <div class="cron-tab-content">
          <el-radio-group v-model="cronConfig.day.type" @change="updateCron">
            <el-radio label="every">每天 允许的通配符[,-*/LW]</el-radio>
            <el-radio label="notspecified">不指定</el-radio>
            <el-radio label="cycle">周期</el-radio>
            <el-radio label="start">从...日开始,每...天执行一次</el-radio>
            <el-radio label="workday">每月...号最近的那个工作日</el-radio>
            <el-radio label="lastday">本月最后一天</el-radio>
            <el-radio label="specify">指定</el-radio>
          </el-radio-group>
          
          <div v-if="cronConfig.day.type === 'cycle'" class="cron-input-group">
            <span>从</span>
            <el-input-number v-model="cronConfig.day.start" :min="1" :max="31" @change="updateCron" />
            <span>-</span>
            <el-input-number v-model="cronConfig.day.end" :min="1" :max="31" @change="updateCron" />
            <span>日</span>
          </div>
          
          <div v-if="cronConfig.day.type === 'start'" class="cron-input-group">
            <span>从</span>
            <el-input-number v-model="cronConfig.day.start" :min="1" :max="31" @change="updateCron" />
            <span>日开始,每</span>
            <el-input-number v-model="cronConfig.day.interval" :min="1" :max="31" @change="updateCron" />
            <span>天执行一次</span>
          </div>
          
          <div v-if="cronConfig.day.type === 'workday'" class="cron-input-group">
            <span>每月</span>
            <el-input-number v-model="cronConfig.day.workday" :min="1" :max="31" @change="updateCron" />
            <span>号最近的那个工作日</span>
          </div>
          
          <div v-if="cronConfig.day.type === 'specify'" class="cron-checkbox-grid">
            <div class="grid-title">指定日期：</div>
            <div class="checkbox-grid">
              <el-checkbox 
                v-for="i in 31" 
                :key="i" 
                v-model="cronConfig.day.specified[i-1]"
                @change="updateCron"
              >
                {{ String(i).padStart(2, '0') }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="月" name="month">
        <div class="cron-tab-content">
          <el-radio-group v-model="cronConfig.month.type" @change="updateCron">
            <el-radio label="every">每月 允许的通配符[,-*/]</el-radio>
            <el-radio label="notspecified">不指定</el-radio>
            <el-radio label="cycle">周期</el-radio>
            <el-radio label="start">从...月开始,每...月执行一次</el-radio>
            <el-radio label="specify">指定</el-radio>
          </el-radio-group>
          
          <div v-if="cronConfig.month.type === 'cycle'" class="cron-input-group">
            <span>从</span>
            <el-input-number v-model="cronConfig.month.start" :min="1" :max="12" @change="updateCron" />
            <span>-</span>
            <el-input-number v-model="cronConfig.month.end" :min="1" :max="12" @change="updateCron" />
            <span>月</span>
          </div>
          
          <div v-if="cronConfig.month.type === 'start'" class="cron-input-group">
            <span>从</span>
            <el-input-number v-model="cronConfig.month.start" :min="1" :max="12" @change="updateCron" />
            <span>月开始,每</span>
            <el-input-number v-model="cronConfig.month.interval" :min="1" :max="12" @change="updateCron" />
            <span>月执行一次</span>
          </div>
          
          <div v-if="cronConfig.month.type === 'specify'" class="cron-checkbox-grid">
            <div class="grid-title">指定月份：</div>
            <div class="checkbox-grid">
              <el-checkbox 
                v-for="i in 12" 
                :key="i" 
                v-model="cronConfig.month.specified[i-1]"
                @change="updateCron"
              >
                {{ String(i).padStart(2, '0') }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="周" name="week">
        <div class="cron-tab-content">
          <el-radio-group v-model="cronConfig.week.type" @change="updateCron">
            <el-radio label="every">每周 允许的通配符[,-*/L#]</el-radio>
            <el-radio label="notspecified">不指定</el-radio>
            <el-radio label="cycle">周期</el-radio>
            <el-radio label="start">从第...天开始,间隔...天执行一次</el-radio>
            <el-radio label="lastweek">本月最后一周的第...天</el-radio>
            <el-radio label="specify">指定</el-radio>
          </el-radio-group>
          
          <div v-if="cronConfig.week.type === 'cycle'" class="cron-input-group">
            <span>周期 每周第</span>
            <el-input-number v-model="cronConfig.week.start" :min="1" :max="7" @change="updateCron" />
            <span>天-第</span>
            <el-input-number v-model="cronConfig.week.end" :min="1" :max="7" @change="updateCron" />
            <span>天</span>
          </div>
          
          <div v-if="cronConfig.week.type === 'start'" class="cron-input-group">
            <span>从第</span>
            <el-input-number v-model="cronConfig.week.start" :min="1" :max="7" @change="updateCron" />
            <span>天开始,间隔</span>
            <el-input-number v-model="cronConfig.week.interval" :min="1" :max="7" @change="updateCron" />
            <span>天执行一次</span>
          </div>
          
          <div v-if="cronConfig.week.type === 'lastweek'" class="cron-input-group">
            <span>本月最后一周的第</span>
            <el-input-number v-model="cronConfig.week.lastweek" :min="1" :max="7" @change="updateCron" />
            <span>天</span>
          </div>
          
          <div v-if="cronConfig.week.type === 'specify'" class="cron-checkbox-grid">
            <div class="grid-title">指定星期：</div>
            <div class="checkbox-grid">
              <el-checkbox 
                v-for="(day, index) in weekDays" 
                :key="index" 
                v-model="cronConfig.week.specified[index]"
                @change="updateCron"
              >
                {{ day }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="年" name="year">
        <div class="cron-tab-content">
          <el-radio-group v-model="cronConfig.year.type" @change="updateCron">
            <el-radio label="notspecified">不指定 允许的通配符[,-*/非必填]</el-radio>
            <el-radio label="every">每年</el-radio>
            <el-radio label="cycle">周期</el-radio>
            <el-radio label="specify">指定</el-radio>
          </el-radio-group>
          
          <div v-if="cronConfig.year.type === 'cycle'" class="cron-input-group">
            <span>周期从</span>
            <el-input-number v-model="cronConfig.year.start" :min="2024" :max="2100" @change="updateCron" />
            <span>-</span>
            <el-input-number v-model="cronConfig.year.end" :min="2024" :max="2100" @change="updateCron" />
            <span>年</span>
          </div>
          
          <div v-if="cronConfig.year.type === 'specify'" class="cron-input-group">
            <span>指定年份：</span>
            <el-input-number v-model="cronConfig.year.specified" :min="2024" :max="2100" @change="updateCron" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <div class="cron-preview">
      <h4>Cron表达式预览：</h4>
      <el-input v-model="cronExpression" readonly />
      <div class="last-run-time">
        <span>最近运行时间：</span>
        <span>{{ getNextRunTime() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface CronConfig {
  second: { 
    type: string; 
    start: number; 
    end: number;
    interval: number;
    specified: boolean[];
  }
  minute: { 
    type: string; 
    start: number; 
    end: number;
    interval: number;
    specified: boolean[];
  }
  hour: { 
    type: string; 
    start: number; 
    end: number;
    interval: number;
    specified: boolean[];
  }
  day: { 
    type: string; 
    start: number; 
    end: number;
    interval: number;
    workday: number;
    specified: boolean[];
  }
  month: { 
    type: string; 
    start: number; 
    end: number;
    interval: number;
    specified: boolean[];
  }
  week: { 
    type: string; 
    start: number; 
    end: number;
    interval: number;
    lastweek: number;
    specified: boolean[];
  }
  year: { 
    type: string; 
    start: number; 
    end: number;
    specified: number;
  }
}

defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const activeTab = ref('second')
const cronExpression = ref('')
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const cronConfig = reactive<CronConfig>({
  second: { type: 'every', start: 0, end: 1, interval: 1, specified: new Array(60).fill(false) },
  minute: { type: 'every', start: 0, end: 1, interval: 1, specified: new Array(60).fill(false) },
  hour: { type: 'every', start: 0, end: 1, interval: 1, specified: new Array(24).fill(false) },
  day: { type: 'every', start: 1, end: 2, interval: 1, workday: 1, specified: new Array(31).fill(false) },
  month: { type: 'every', start: 1, end: 2, interval: 1, specified: new Array(12).fill(false) },
  week: { type: 'notspecified', start: 1, end: 2, interval: 1, lastweek: 1, specified: new Array(7).fill(false) },
  year: { type: 'notspecified', start: 2024, end: 2029, specified: 2024 }
})

// 生成Cron表达式
function generateCronExpression() {
  const parts = []
  
  // 秒
  if (cronConfig.second.type === 'every') {
    parts.push('*')
  } else if (cronConfig.second.type === 'cycle') {
    parts.push(`${cronConfig.second.start}-${cronConfig.second.end}`)
  } else if (cronConfig.second.type === 'start') {
    parts.push(`${cronConfig.second.start}/${cronConfig.second.interval}`)
  } else if (cronConfig.second.type === 'specify') {
    const specified = cronConfig.second.specified
      .map((checked, index) => checked ? index : null)
      .filter(val => val !== null)
    parts.push(specified.length > 0 ? specified.join(',') : '*')
  }
  
  // 分钟
  if (cronConfig.minute.type === 'every') {
    parts.push('*')
  } else if (cronConfig.minute.type === 'cycle') {
    parts.push(`${cronConfig.minute.start}-${cronConfig.minute.end}`)
  } else if (cronConfig.minute.type === 'start') {
    parts.push(`${cronConfig.minute.start}/${cronConfig.minute.interval}`)
  } else if (cronConfig.minute.type === 'specify') {
    const specified = cronConfig.minute.specified
      .map((checked, index) => checked ? index : null)
      .filter(val => val !== null)
    parts.push(specified.length > 0 ? specified.join(',') : '*')
  }
  
  // 小时
  if (cronConfig.hour.type === 'every') {
    parts.push('*')
  } else if (cronConfig.hour.type === 'cycle') {
    parts.push(`${cronConfig.hour.start}-${cronConfig.hour.end}`)
  } else if (cronConfig.hour.type === 'start') {
    parts.push(`${cronConfig.hour.start}/${cronConfig.hour.interval}`)
  } else if (cronConfig.hour.type === 'specify') {
    const specified = cronConfig.hour.specified
      .map((checked, index) => checked ? index : null)
      .filter(val => val !== null)
    parts.push(specified.length > 0 ? specified.join(',') : '*')
  }
  
  // 日
  if (cronConfig.day.type === 'every') {
    parts.push('*')
  } else if (cronConfig.day.type === 'notspecified') {
    parts.push('?')
  } else if (cronConfig.day.type === 'cycle') {
    parts.push(`${cronConfig.day.start}-${cronConfig.day.end}`)
  } else if (cronConfig.day.type === 'start') {
    parts.push(`${cronConfig.day.start}/${cronConfig.day.interval}`)
  } else if (cronConfig.day.type === 'workday') {
    parts.push(`${cronConfig.day.workday}W`)
  } else if (cronConfig.day.type === 'lastday') {
    parts.push('L')
  } else if (cronConfig.day.type === 'specify') {
    const specified = cronConfig.day.specified
      .map((checked, index) => checked ? index + 1 : null)
      .filter(val => val !== null)
    parts.push(specified.length > 0 ? specified.join(',') : '*')
  }
  
  // 月
  if (cronConfig.month.type === 'every') {
    parts.push('*')
  } else if (cronConfig.month.type === 'notspecified') {
    parts.push('?')
  } else if (cronConfig.month.type === 'cycle') {
    parts.push(`${cronConfig.month.start}-${cronConfig.month.end}`)
  } else if (cronConfig.month.type === 'start') {
    parts.push(`${cronConfig.month.start}/${cronConfig.month.interval}`)
  } else if (cronConfig.month.type === 'specify') {
    const specified = cronConfig.month.specified
      .map((checked, index) => checked ? index + 1 : null)
      .filter(val => val !== null)
    parts.push(specified.length > 0 ? specified.join(',') : '*')
  }
  
  // 周
  if (cronConfig.week.type === 'every') {
    parts.push('*')
  } else if (cronConfig.week.type === 'notspecified') {
    parts.push('?')
  } else if (cronConfig.week.type === 'cycle') {
    parts.push(`${cronConfig.week.start}-${cronConfig.week.end}`)
  } else if (cronConfig.week.type === 'start') {
    parts.push(`${cronConfig.week.start}/${cronConfig.week.interval}`)
  } else if (cronConfig.week.type === 'lastweek') {
    parts.push(`${cronConfig.week.lastweek}L`)
  } else if (cronConfig.week.type === 'specify') {
    const specified = cronConfig.week.specified
      .map((checked, index) => checked ? index + 1 : null)
      .filter(val => val !== null)
    parts.push(specified.length > 0 ? specified.join(',') : '*')
  }
  
  // 年
  if (cronConfig.year.type === 'notspecified') {
    parts.push('*')
  } else if (cronConfig.year.type === 'every') {
    parts.push('*')
  } else if (cronConfig.year.type === 'cycle') {
    parts.push(`${cronConfig.year.start}-${cronConfig.year.end}`)
  } else if (cronConfig.year.type === 'specify') {
    parts.push(cronConfig.year.specified.toString())
  }
  
  return parts.join(' ')
}

// 获取下次运行时间（简化版本）
function getNextRunTime() {
  const now = new Date()
  const nextRun = new Date(now.getTime() + 60000) // 简单示例：1分钟后
  return nextRun.toLocaleString('zh-CN')
}

// 更新Cron表达式
function updateCron() {
  const expression = generateCronExpression()
  cronExpression.value = expression
  emit('update:modelValue', expression)
  emit('change', expression)
}

onMounted(() => {
  updateCron()
})
</script>

<style lang="scss" scoped>
.cron-expression {
  padding: 20px;
  
  .cron-tab-content {
    padding: 20px 0;
    
    .el-radio-group {
      margin-bottom: 20px;
      
      .el-radio {
        display: block;
        margin-bottom: 10px;
        line-height: 1.5;
      }
    }
    
    .cron-input-group {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 15px;
      margin-bottom: 15px;
      
      .el-input-number {
        width: 80px;
      }
    }
    
    .cron-checkbox-grid {
      margin-top: 15px;
      
      .grid-title {
        font-weight: bold;
        margin-bottom: 10px;
        color: #606266;
      }
      
      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 8px;
        max-height: 200px;
        overflow-y: auto;
        padding: 10px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        background-color: #fafafa;
        
        .el-checkbox {
          margin-right: 0;
          
          :deep(.el-checkbox__label) {
            font-size: 12px;
          }
        }
      }
    }
  }
  
  .cron-preview {
    margin-top: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    
    h4 {
      margin: 0 0 10px 0;
      color: #606266;
    }
    
    .last-run-time {
      margin-top: 10px;
      font-size: 14px;
      color: #606266;
      
      span:first-child {
        font-weight: bold;
      }
    }
  }
}
</style>

