import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search } from "lucide-react";
import API from '../api';

export default function SpammerCard() {
  const [spammers, setSpammers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchById, setSearchById] = useState('');

  useEffect(() => {
    fetchAllSpammers();
  }, []);

  const fetchAllSpammers = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/spams/spammers');
      if (response.data.status === 'success') {
        setSpammers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching spammers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpammerById = async (id) => {
    setLoading(true);
    try {
      const response = await API.get(`/api/spams/detect/${id}`);
      if (response.data.status === 'success') {
        setSpammers([response.data.data]);
      }
    } catch (error) {
      console.error('No spammer found with this ID:', error);
      setSpammers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Spammer Annotators
        </CardTitle>
        <div className="flex items-center space-x-2 mt-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID..."
            value={searchById}
            onChange={(e) => setSearchById(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchById.trim() !== '') {
                fetchSpammerById(searchById.trim());
              }
            }}
            className="h-8 w-[250px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchById('');
              fetchAllSpammers();
            }}
          >
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Spammer</TableHead>
              <TableHead>Detection Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : spammers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No spammers found
                </TableCell>
              </TableRow>
            ) : (
              spammers.map((spammer) => (
                <TableRow key={spammer.id}>
                  <TableCell>{spammer.id}</TableCell>
                  <TableCell>{spammer.firstName}</TableCell>
                  <TableCell>{spammer.lastName}</TableCell>
                  <TableCell>{spammer.email}</TableCell>
                  <TableCell>
                    <Badge variant={spammer.active ? "success" : "destructive"}>
                      {spammer.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={spammer.spammer ? "destructive" : "outline"}>
                      {spammer.spammer ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(spammer.detectionDate).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}