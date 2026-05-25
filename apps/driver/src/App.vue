<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

type Position = {
  latitude: number;
  longitude: number;
};

const apiBase = import.meta.env.VITE_API_BASE_URL || '';
const tg = window.Telegram?.WebApp;
const fileInput = ref<HTMLInputElement | null>(null);
const driverName = ref('Водитель');
const tgId = ref('');
const status = ref('Готово к проверке');
const gpsStatus = ref('GPS не получен');
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
  driverName.value = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || driverName.value;
}

function getNativeTelegramLocation(): Promise<Position> {
  return new Promise((resolve, reject) => {
    const manager = tg?.LocationManager;
    if (!manager) {
      reject(new Error('Telegram LocationManager недоступен'));
      return;
    }
    const onLocation = (location: any) => {
      const latitude = Number(location?.latitude);
      const longitude = Number(location?.longitude);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) resolve({ latitude, longitude });
      else reject(new Error('GPS пустой'));
    };
    try {
      if (typeof manager.getLocation === 'function') {
        manager.getLocation(onLocation);
      } else if (typeof tg.requestLocation === 'function') {
        tg.requestLocation(onLocation);
      } else {
        reject(new Error('Telegram GPS API не поддерживается'));
      }
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Telegram GPS error'));
    }
  });
}

function getBrowserLocation(): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation недоступен'));
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
  gpsStatus.value = 'Получение GPS...';
  errorText.value = '';
  try {
    position.value = await getNativeTelegramLocation().catch(() => getBrowserLocation());
    gpsStatus.value = 'GPS получен';
    status.value = 'Можно сделать фото';
  } catch {
    position.value = null;
    gpsStatus.value = 'GPS отклонён';
    status.value = 'GPS обязателен';
    showAlert('Пожалуйста, включите GPS');
  }
}

function openCamera() {
  if (!position.value) {
    showAlert('Пожалуйста, включите GPS');
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
  status.value = 'Фото готово к отправке';
}

async function submitCheckpoint() {
  if (!position.value || !photo.value) {
    showAlert('Сначала получите GPS и сделайте фото');
    return;
  }
  sending.value = true;
  errorText.value = '';
  status.value = 'Отправка...';
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
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || 'Ошибка отправки');
    result.value = payload;
    status.value = 'Точка сохранена';
    if (tg?.HapticFeedback?.notificationOccurred) tg.HapticFeedback.notificationOccurred('success');
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : 'Ошибка отправки';
    status.value = 'Ошибка';
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
    <section class="top">
      <div>
        <p class="label">Водитель</p>
        <h1>{{ driverName }}</h1>
      </div>
      <span class="status">{{ status }}</span>
    </section>

    <section class="camera-card">
      <button class="camera-button" :disabled="!canShoot" @click="openCamera">
        <span>📷</span>
        <strong>Сделать фото</strong>
        <small>Снять машину</small>
      </button>
      <input ref="fileInput" class="hidden" type="file" accept="image/*" capture="environment" @change="onPhotoChange" />
      <img v-if="previewUrl" class="preview" :src="previewUrl" alt="Фото машины" />
      <button v-if="photo" class="submit" :disabled="sending" @click="submitCheckpoint">
        {{ sending ? 'Отправка...' : 'Отправить отметку' }}
      </button>
    </section>

    <section class="gps">
      <div>
        <p class="label">GPS</p>
        <strong>{{ locationText }}</strong>
      </div>
      <button class="ghost" @click="requestLocation">Обновить GPS</button>
    </section>

    <section v-if="result" class="result">
      <h2>Сохранено</h2>
      <p>{{ result.timeText }}</p>
      <p>{{ result.addressRu || result.addressZh || 'Адрес не найден' }}</p>
      <a v-if="result.watermarkedImageUrl" :href="result.watermarkedImageUrl" target="_blank">Открыть фото с водяным знаком</a>
    </section>

    <p v-if="errorText" class="error">{{ errorText }}</p>
  </main>
</template>
