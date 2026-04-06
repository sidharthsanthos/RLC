import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

const DailyRateCard = () => {

  const [rate, setRate] = useState(null)
  const [draftRate, setDraftRate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchTodayRate()
  }, [])

  const fetchTodayRate = async () => {
    try {
      const { data, error } = await supabase
        .from('Day_Details')
        .select('rate')
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error(error.message)
        return
      }

      if (data) setRate(data.rate)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    setDraftRate(rate !== null ? String(rate) : '')
    setModalVisible(true)
  }

  const saveRate = async () => {
    if (!draftRate) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('Day_Details')
        .upsert({ date: today, rate: Number(draftRate) }, { onConflict: 'date' })

      if (error) throw error

      setRate(Number(draftRate))
      setModalVisible(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today's Rate</Text>

      <TouchableOpacity style={styles.rateTile} onPress={openModal} activeOpacity={0.75}>
        <Text style={styles.rateTileLabel}>Current Rate</Text>
        {loading ? (
          <Text style={styles.rateValue}>—</Text>
        ) : rate !== null ? (
          <Text style={styles.rateValue}>₹ {rate}</Text>
        ) : (
          <Text style={styles.ratePlaceholder}>Tap to set</Text>
        )}
        <Text style={styles.editHint}>✎ Tap to edit</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContainer}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Today's Rate</Text>
                <Text style={styles.modalDate}>{today}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Current rate display */}
            <View style={styles.currentRateBox}>
              <Text style={styles.currentRateLabel}>Current Rate</Text>
              <Text style={styles.currentRateValue}>
                {rate !== null ? `₹ ${rate}` : 'Not set'}
              </Text>
            </View>

            {/* Input */}
            <Text style={styles.inputLabel}>Enter New Rate</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3200"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              value={draftRate}
              onChangeText={setDraftRate}
              autoFocus
            />

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, (!draftRate || saving) && styles.saveBtnDisabled]}
              onPress={saveRate}
              disabled={!draftRate || saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? (rate !== null ? 'Updating...' : 'Saving...') : (rate !== null ? 'Update Rate' : 'Save Rate')}
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

export default DailyRateCard

const styles = StyleSheet.create({
  // ── Card ──────────────────────────────────
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },

  rateTile: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },

  rateTileLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },

  rateValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 6,
  },

  ratePlaceholder: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 6,
  },

  editHint: {
    fontSize: 12,
    color: '#388E3C',
    fontWeight: '500',
  },

  // ── Modal ─────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 22,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },

  modalDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  closeIcon: {
    fontSize: 20,
    color: '#777',
    paddingHorizontal: 4,
  },

  currentRateBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },

  currentRateLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },

  currentRateValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#fafafa',
    marginBottom: 18,
  },

  saveBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  saveBtnDisabled: {
    backgroundColor: '#a5d6a7',
  },

  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
})