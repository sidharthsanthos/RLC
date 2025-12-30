import { Platform, StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

const EditConsumer = ({ route }) => {
  const { consumerID } = route.params;
  const [consumer, setConsumer] = useState(null);

  // Local editable states
  const [name, setName] = useState("");
  const [byName, setByName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  const fetchConsumer = async () => {
    try {
      const { data, error } = await supabase
        .from("Consumers")
        .select("*")
        .eq("id", consumerID);

      if (error) {
        console.error("Consumer Fetching Error Occured", error.message);
        return;
      }

      const c = data[0];
      setConsumer(c);

      // Pre-fill fields
      setName(c.Name);
      setByName(c.By_Name);
      setAddress(c.Address);
      setContact(String(c.Contact));

    } catch (err) {
      console.error("Unexpected Error Occured", err);
    }
  };

  useEffect(() => {
    fetchConsumer();
  }, []);

  // UPDATE QUERY (ONLY CHANGED FIELDS)
  const updateConsumer = async () => {
    if (!consumer) return;

    let updatedFields = {};

    if (name !== consumer.Name) updatedFields.Name = name;
    if (byName !== consumer.By_Name) updatedFields.By_Name = byName;
    if (address !== consumer.Address) updatedFields.Address = address;
    if (contact !== consumer.Contact) updatedFields.Contact = contact;

    if (Object.keys(updatedFields).length === 0) {
      alert("No changes to update.");
      return;
    }

    const { error } = await supabase
      .from("Consumers")
      .update(updatedFields)
      .eq("id", consumerID);

    if (error) {
      alert("Update Failed: " + error.message);
    } else {
      alert("Consumer Updated Successfully!");
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Edit Consumer</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Consumer Name"
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

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Contact"
        value={contact}
        keyboardType="phone-pad"
        onChangeText={setContact}
      />

      <TouchableOpacity style={styles.btn} onPress={updateConsumer}>
        <Text style={styles.btnText}>Update Consumer</Text>
      </TouchableOpacity>

    </View>
  );
};

export default EditConsumer;

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
