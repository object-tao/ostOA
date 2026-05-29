<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

type Position = {
  latitude: number;
  longitude: number;
};

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://api.ostoa.org';
const tg = window.Telegram?.WebApp;
const isTelegram = Boolean(tg?.initData);
const fileInput = ref<HTMLInputElement | null>(null);
const driverName = ref('Водитель / 司机');
const tgId = ref('');
const status = ref('Готово / 准备中');
const gpsStatus = ref('GPS не получен / 未获取 GPS');
const position = ref<Position | null>(null);
const photo = ref<File | null>(null);
const previewUrl = ref('');
const sending = ref(false);
const result = ref<any>(null);
const errorText = ref('');

const canShoot = computed(() => Boolean(position.value) && !sending.value);
const locationText = computed(() =>
  position.value
    ? `${position.value.latitude.toFixed(6)}, ${position.value.longitude.toFixed(6)}`
    : gpsStatus.value,
);

function showAlert(message: string) {
  if (tg?.showAlert) tg.showAlert(message);
  else window.alert(message);
}

function readTelegramUser() {
  const user = tg?.initDataUnsafe?.user;
  if (!user) return;
  tgId.value = String(user.id || '');
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;
  driverName.value = name ? `${name}` : driverName.value;
}

function getNativeTelegramLocation(): Promise<Position> {
  return new Promise((resolve, reject) => {
    const manager = tg?.LocationManager;
    if (!manager) {
      reject(new Error('Telegram LocationManager недоступен / Telegram 定位不可用'));
      return;
    }
    const onLocation = (location: any) => {
      const latitude = Number(location?.latitude);
      const longitude = Number(location?.longitude);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) resolve({ latitude, longitude });
      else reject(new Error('GPS пустой / GPS 为空'));
    };
    try {
      if (typeof manager.getLocation === 'function') {
        manager.getLocation(onLocation);
      } else if (typeof tg.requestLocation === 'function') {
        tg.requestLocation(onLocation);
      } else {
        reject(new Error('Telegram GPS API не поддерживается / 当前 Telegram 不支持定位接口'));
      }
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Telegram GPS error'));
    }
  });
}

function getBrowserLocation(): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation недоступен / 浏览器定位不可用'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

async function requestLocation() {
  gpsStatus.value = 'Получение GPS... / 正在获取 GPS...';
  errorText.value = '';
  try {
    position.value = await getNativeTelegramLocation().catch(() => getBrowserLocation());
    gpsStatus.value = 'GPS получен / GPS 已获取';
    status.value = 'Можно сделать фото / 可以拍照';
  } catch {
    position.value = null;
    gpsStatus.value = 'GPS отклонён / GPS 被拒绝';
    status.value = 'GPS обязателен / 必须开启 GPS';
    showAlert('Пожалуйста, включите GPS / 请开启 GPS');
  }
}

function openCamera() {
  if (!position.value) {
    showAlert('Пожалуйста, включите GPS / 请开启 GPS');
    return;
  }
  fileInput.value?.click();
}

function onPhotoChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  photo.value = file;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);
  status.value = 'Фото готово / 照片已准备';
}

async function submitCheckpoint() {
  if (!position.value || !photo.value) {
    showAlert('Сначала получите GPS и сделайте фото / 请先获取 GPS 并拍照');
    return;
  }
  if (!isTelegram) {
    errorText.value = 'Откройте страницу через Telegram Bot / 请通过 Telegram Bot 打开页面';
    return;
  }
  sending.value = true;
  errorText.value = '';
  status.value = 'Отправка... / 正在提交...';
  try {
    const form = new FormData();
    form.append('tg_id', tgId.value || 'unknown');
    form.append('tg_name', driverName.value);
    form.append('init_data', tg?.initData || '');
    form.append('latitude', String(position.value.latitude));
    form.append('longitude', String(position.value.longitude));
    form.append('image_file', photo.value);
    const response = await fetch(`${apiBase}/api/driver/upload-checkpoint`, {
      method: 'POST',
      body: form,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || 'Ошибка отправки / 提交失败');
    result.value = payload;
    status.value = 'Точка сохранена / 打卡已保存';
    if (tg?.HapticFeedback?.notificationOccurred) tg.HapticFeedback.notificationOccurred('success');
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Ошибка отправки / 提交失败';
    errorText.value =
      detail === 'Load failed' || detail === 'Failed to fetch'
        ? 'Не удалось подключиться к API. Проверьте сеть и откройте страницу заново через Telegram. / 无法连接 API，请检查网络，并从 Telegram 重新打开页面。'
        : detail;
    status.value = 'Ошибка / 错误';
    if (tg?.HapticFeedback?.notificationOccurred) tg.HapticFeedback.notificationOccurred('error');
  } finally {
    sending.value = false;
  }
}

onMounted(() => {
  tg?.ready?.();
  tg?.expand?.();
  readTelegramUser();
  void requestLocation();
});
</script>

<template>
  <main class="page">
    <section v-if="!isTelegram" class="notice">
      <strong>Откройте через Telegram / 请通过 Telegram 打开</strong>
      <span>Фото можно протестировать, но отправка разрешена только из Telegram Mini App.</span>
      <span>可以测试拍照，但正式提交必须从 Telegram Mini App 打开。</span>
    </section>

    <section class="top">
      <div>
        <p class="label">Водитель / 司机</p>
        <h1>{{ driverName }}</h1>
      </div>
      <span class="status">{{ status }}</span>
    </section>

    <section class="camera-card">
      <button class="camera-button" :disabled="!canShoot" @click="openCamera">
        <span>📷</span>
        <strong>Сделать фото / 拍照</strong>
        <small>Снять машину / 拍摄车辆</small>
      </button>
      <input ref="fileInput" class="hidden" type="file" accept="image/*" capture="environment" @change="onPhotoChange" />
      <img v-if="previewUrl" class="preview" :src="previewUrl" alt="Фото машины / 车辆照片" />
      <button v-if="photo" class="submit" :disabled="sending" @click="submitCheckpoint">
        {{ sending ? 'Отправка... / 正在提交...' : 'Отправить отметку / 提交打卡' }}
      </button>
    </section>

    <section class="gps">
      <div>
        <p class="label">GPS / 定位</p>
        <strong>{{ locationText }}</strong>
      </div>
      <button class="ghost" @click="requestLocation">Обновить GPS / 刷新定位</button>
    </section>

    <section v-if="result" class="result">
      <h2>Сохранено / 已保存</h2>
      <p>{{ result.timeText }}</p>
      <p>{{ result.addressRu || result.addressZh || 'Адрес не найден / 未获取地址' }}</p>
      <a v-if="result.watermarkedImageUrl" :href="result.watermarkedImageUrl" target="_blank">Открыть фото с водяным знаком / 查看水印照片</a>
    </section>

    <p v-if="errorText" class="error">{{ errorText }}</p>
  </main>
</template>
