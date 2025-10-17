import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSessionStore } from '../../state/session';

export function LoginScreen(): React.JSX.Element {
  const status = useSessionStore((state) => state.status);
  const requestMagicLink = useSessionStore((state) => state.requestMagicLink);
  const confirmMagicLink = useSessionStore((state) => state.confirmMagicLink);
  const error = useSessionStore((state) => state.error);
  const pendingEmail = useSessionStore((state) => state.pendingEmail);
  const debugCode = useSessionStore((state) => state.debugCode);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const isLoading = status === 'loading';

  const canRequestLink = useMemo(() => email.includes('@'), [email]);

  const handleSendLink = async () => {
    if (!canRequestLink) {
      Alert.alert('Enter a valid email address to continue.');
      return;
    }
    try {
      await requestMagicLink(email.trim().toLowerCase());
    } catch (err) {
      Alert.alert('Unable to request magic link', String(err));
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmMagicLink(code.trim());
    } catch (err) {
      Alert.alert('Unable to confirm login', String(err));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back to Novoice</Text>
        <Text style={styles.subtitle}>
          Sign in with your email address. We will send you a secure magic link.
        </Text>
        <TextInput
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          editable={!isLoading && status !== 'awaiting-link'}
        />
        <TouchableOpacity
          style={[styles.button, !canRequestLink || isLoading ? styles.buttonDisabled : null]}
          onPress={handleSendLink}
          disabled={!canRequestLink || isLoading || status === 'awaiting-link'}
        >
          <Text style={styles.buttonText}>
            {status === 'awaiting-link' ? 'Link Sent' : 'Send Magic Link'}
          </Text>
        </TouchableOpacity>

        {status === 'awaiting-link' && (
          <View style={styles.verifyContainer}>
            <Text style={styles.verifyLabel}>
              Enter the 6-digit code from your email to finish signing in.
            </Text>
            <TextInput
              placeholder="123456"
              keyboardType="number-pad"
              style={styles.input}
              value={code}
              onChangeText={setCode}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.button, isLoading ? styles.buttonDisabled : null]}
              onPress={handleConfirm}
              disabled={isLoading || code.trim().length < 3}
            >
              <Text style={styles.buttonText}>Confirm Login</Text>
            </TouchableOpacity>
          </View>
        )}
        {!!pendingEmail && (
          <Text style={styles.pendingLabel}>
            Magic link sent to <Text style={styles.pendingEmail}>{pendingEmail}</Text>
          </Text>
        )}
        {!!debugCode && (
          <Text style={styles.debugCode}>
            Dev shortcut code:{' '}
            <Text style={styles.debugCodeValue}>{debugCode}</Text>
          </Text>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    gap: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 14,
    color: '#475569'
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd'
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  },
  verifyContainer: {
    gap: 12
  },
  verifyLabel: {
    fontSize: 14,
    color: '#1f2937'
  },
  pendingLabel: {
    textAlign: 'center',
    color: '#1d4ed8'
  },
  pendingEmail: {
    fontWeight: '600'
  },
  debugCode: {
    textAlign: 'center',
    color: '#0369a1'
  },
  debugCodeValue: {
    fontWeight: '700'
  },
  error: {
    textAlign: 'center',
    color: '#dc2626'
  }
});
