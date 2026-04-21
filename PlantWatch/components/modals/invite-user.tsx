import { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { inviteUser } from '@/services/greenhouse';

interface InviteUserProps {
  visible: boolean;
  greenhouseId: string;
  onClose: () => void;
}

export function InviteUser({ visible, greenhouseId, onClose }: InviteUserProps) {
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);

  const [email, setEmail] = useState('');

  function handleClose() {
    setEmail('');
    onClose();
  }

  async function handleSubmit() {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address.');
      return;
    }
    const { error } = await inviteUser(greenhouseId, email.trim());
    if (error) {
      Alert.alert('Error', error);
    } else {
      handleClose();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modal}>
            <ThemedText style={styles.modalTitle}>Invite User</ThemedText>

            <ThemedText style={styles.fieldLabel}>Email</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <ThemedText style={styles.submitButtonText}>Send Invite</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.062,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: ThemeColors.header,
    marginBottom: height * 0.019,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: height * 0.014,
    fontSize: 16,
    marginBottom: height * 0.012,
  },
  submitButton: {
    backgroundColor: ThemeColors.button,
    padding: height * 0.0166,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: height * 0.005,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelText: {
    textAlign: 'center',
    marginTop: height * 0.014,
    color: '#999',
    fontSize: 14,
  },
});
