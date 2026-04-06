import {
  Platform, StatusBar, StyleSheet, Text, View,
  TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../utils/supabase';

const SOUTH_STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Puducherry"
];

const EditSupplier = ({ route }) => {
  const { supplierID } = route.params;
  const [supplier, setSupplier] = useState(null);

  const [name, setName] = useState('');
  const [byName, setByName] = useState('');
  const [type, setType] = useState(1);
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [contact, setContact] = useState('');
  const [bagWeight, setBagWeight] = useState('');
  const [ready, setReady] = useState(false);

  const fetchSupplier = async () => {
    try {
      const { data, error } = await supabase
        .from('Suppliers')
        .select('*')
        .eq('id', supplierID);

      if (error) {
        console.error('Supplier Fetching Error Occured', error.message);
        return;
      }

      const s = data[0];
      setSupplier(s);

      setName(s.Name ?? '');
      setByName(s.By_Name ?? '');
      setType(s.Supply_Type ?? 1);
      setAddress(s.Address ?? '');
      setState(s.State ?? '');
      setContact(String(s.Contact ?? ''));
      setBagWeight(s.Bag_Weight != null ? String(s.Bag_Weight) : '');

      setReady(true);
    } catch (err) {
      console.error('Unexpected Error Occured', err);
    }
  };

  useEffect(() => {
    fetchSupplier();
  }, []);

  const updateSupplier = async () => {
    if (!supplier) return;

    let updatedFields = {};

    if (name !== supplier.Name) updatedFields.Name = name;
    if (byName !== supplier.By_Name) updatedFields.By_Name = byName;
    if (type !== supplier.Supply_Type) updatedFields.Supply_Type = type;
    if (address !== supplier.Address) updatedFields.Address = address;
    if (state !== supplier.State) updatedFields.State = state;
    if (contact !== String(supplier.Contact)) updatedFields.Contact = contact;

    const newBagWeight = bagWeight ? Number(bagWeight) : null;
    if (newBagWeight !== supplier.Bag_Weight) updatedFields.Bag_Weight = newBagWeight;

    if (Object.keys(updatedFields).length === 0) {
      alert('No changes to update.');
      return;
    }

    const { error } = await supabase
      .from('Suppliers')
      .update(updatedFields)
      .eq('id', supplierID);

    if (error) {
      alert('Update Failed: ' + error.message);
    } else {
      alert('Supplier Updated Successfully!');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Edit Supplier</Text>

        {/* Supplier Name */}
        <Text style={styles.label}>Supply Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Supplier Name"
          value={name}
          onChangeText={setName}
        />

        {/* By Name */}
        <Text style={styles.label}>Supply ByName</Text>
        <TextInput
          style={styles.input}
          placeholder="By Name / Shop Name"
          value={byName}
          onChangeText={setByName}
        />

        {/* Contact */}
        <Text style={styles.label}>Supplier Contact</Text>
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          keyboardType="numeric"
          value={contact}
          onChangeText={setContact}
        />

        {/* Address */}
        <Text style={styles.label}>Supplier Address</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Address"
          multiline
          value={address}
          onChangeText={setAddress}
        />

        {/* State Dropdown */}
        <Text style={styles.label}>State</Text>
        {ready && (
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={state}
              onValueChange={(v) => setState(v)}
            >
              <Picker.Item label="Select State" value="" />
              {SOUTH_STATES.map((s) => (
                <Picker.Item key={s} label={s} value={s} />
              ))}
            </Picker>
          </View>
        )}

        {/* Supply Type Dropdown */}
        <Text style={styles.label}>Supply Type</Text>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(v) => setType(v)}
          >
            <Picker.Item label="Sack / Bag Wise" value={1} />
            <Picker.Item label="Kg Wise" value={2} />
          </Picker>
        </View>

        {/* Bag Weight */}
        <Text style={styles.label}>Bag Weight (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Bag Weight in kg"
          keyboardType="numeric"
          value={bagWeight}
          onChangeText={setBagWeight}
        />

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={updateSupplier}>
          <Text style={styles.buttonText}>Update Supplier</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditSupplier;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 + 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 10,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});