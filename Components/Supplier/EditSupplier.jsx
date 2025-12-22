import { Platform, StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../supabaseConfig';

const SOUTH_STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana"
];

const EditSupplier = ({ route }) => {
  const { supplierID } = route.params;
  const [supplier, setSupplier] = useState(null);

  // Local editable states
  const [name, setName] = useState("");
  const [byName, setByName] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [contact, setContact] = useState("");
  const [ready, setReady] = useState(false);

  const fetchSupplier = async () => {
    try {
      const { data, error } = await supabase
        .from("Suppliers")
        .select("*")
        .eq("id", supplierID);

      if (error) {
        console.error("Supplier Fetching Error Occured", error.message);
        return;
      }

      const s = data[0];
      setSupplier(s);

      // Pre-fill fields
      setName(s.Name);
      setByName(s.By_Name);
      setType(s.Supply_Type);
      setAddress(s.Address);
      setState(s.State);
      setContact(String(s.Contact));

      setReady(true);

    } catch (err) {
      console.error("Unexpected Error Occured", err);
    }
  };

  useEffect(() => {
    fetchSupplier();
  }, []);

  // UPDATE QUERY (ONLY CHANGED FIELDS)
  const updateSupplier = async () => {
    if (!supplier) return;

    let updatedFields = {};

    if (name !== supplier.Name) updatedFields.Name = name;
    if (byName !== supplier.By_Name) updatedFields.By_Name = byName;
    if (type !== supplier.Supply_Type) updatedFields.Supply_Type = type;
    if (address !== supplier.Address) updatedFields.Address = address;
    if (state !== supplier.State) updatedFields.State = state;
    if (contact !== supplier.Contact) updatedFields.Contact = contact;

    if (Object.keys(updatedFields).length === 0) {
      alert("No changes to update.");
      return;
    }

    const { error } = await supabase
      .from("Suppliers")
      .update(updatedFields)
      .eq("id", supplierID);

    if (error) {
      alert("Update Failed: " + error.message);
    } else {
      alert("Supplier Updated Successfully!");
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Edit Supplier</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Supplier Name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>By Name</Text>
      <TextInput
        style={styles.input}
        placeholder="By Name"
        value={byName}
        onChangeText={setByName}
      />

      {/* Supply Type Picker */}
      <Text style={styles.label}>Supply Type</Text>
      <Picker
        selectedValue={type}
        onValueChange={(v) => setType(v)}
        style={styles.picker}
      >
        <Picker.Item label="Select Supply Type" value="" />
        <Picker.Item label="Sack-wise" value={1} />
        <Picker.Item label="Kg-wise" value={2} />
      </Picker>

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      {/* State Picker */}
      <Text style={styles.label}>State</Text>
      {ready && (
        <Picker
            selectedValue={state}
            onValueChange={(v) => setState(v)}
            style={styles.picker}
        >
            <Picker.Item label="Select State" value="" />
            {SOUTH_STATES.map((st) => (
            <Picker.Item label={st} value={st} key={st} />
            ))}
        </Picker>
      )}

      <Text style={styles.label}>Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Contact"
        value={contact}
        keyboardType="phone-pad"
        onChangeText={setContact}
      />

      <TouchableOpacity style={styles.btn} onPress={updateSupplier}>
        <Text style={styles.btnText}>Update Supplier</Text>
      </TouchableOpacity>

    </View>
  );
};

export default EditSupplier;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 8,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
  },
  btn: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
});